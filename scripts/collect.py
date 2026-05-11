import os
import requests
import time
import json
import ast
from urllib.parse import urlparse
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "").strip()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
OPENROUTER_DELAY_SECONDS = int(os.getenv("OPENROUTER_DELAY_SECONDS", "15"))
OPENROUTER_MAX_RETRIES = int(os.getenv("OPENROUTER_MAX_RETRIES", "3"))
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b:free").strip()
MAX_ITEMS_PER_RUN = int(os.getenv("MAX_ITEMS_PER_RUN", "4"))
MAX_RUN_SECONDS = int(os.getenv("MAX_RUN_SECONDS", "1500"))


def require_env(name, value):
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")


def require_url(name, value):
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise RuntimeError(f"{name} must be a full URL like https://your-project.supabase.co")


require_env("TMDB_API_KEY", TMDB_API_KEY)
require_env("OPENROUTER_API_KEY", OPENROUTER_API_KEY)
require_env("SUPABASE_URL", SUPABASE_URL)
require_env("SUPABASE_KEY", SUPABASE_KEY)
require_url("SUPABASE_URL", SUPABASE_URL)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
RATE_LIMITED = object()
MODERATION_BLOCKED = object()
TRANSIENT_OPENROUTER_CODES = {429, 502, 503, 504, 524}
OPTIONAL_INSERT_COLUMNS = ("trailer_url", "title_ja", "body_ja", "summary_ja")
started_at = time.monotonic()

SKIP_TITLE_KEYWORDS = [
    "mother's friend",
    "young sister",
    "special treatment",
    "practice room",
    "rape",
    "raped",
    "sexual abuse",
    "sexual assault",
    "minor",
    "schoolgirl",
    "school girl",
    "teenage girl",
    "underage",
]

SKIP_GENRES = {
    "news",
    "reality",
    "talk",
}


def should_skip_content(title, overview):
    text = f"{title or ''} {overview or ''}".lower()
    return any(keyword in text for keyword in SKIP_TITLE_KEYWORDS)


def should_skip_genres(genres):
    normalized = {genre.lower() for genre in genres}
    return bool(normalized & SKIP_GENRES)


def log(message):
    print(message, flush=True)


def should_stop_for_time_limit():
    elapsed = time.monotonic() - started_at
    if elapsed >= MAX_RUN_SECONDS:
        log(f"Reached MAX_RUN_SECONDS={MAX_RUN_SECONDS}. Stopping this run.")
        return True
    return False


def get_popular_k_content(content_type="tv"):
    url = f"https://api.themoviedb.org/3/discover/{content_type}"
    params = {
        "api_key": TMDB_API_KEY,
        "with_origin_country": "KR",
        "sort_by": "popularity.desc",
        "page": 1
    }
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json().get("results", [])

def get_details(content_id, content_type="tv"):
    url = f"https://api.themoviedb.org/3/{content_type}/{content_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "append_to_response": "credits,images,videos"
    }
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def get_trailer_url(details):
    videos = details.get("videos", {}).get("results", [])
    preferred_types = ("Trailer", "Teaser")

    for video_type in preferred_types:
        for video in videos:
            if video.get("site") == "YouTube" and video.get("type") == video_type and video.get("key"):
                return f"https://www.youtube.com/watch?v={video['key']}"

    return None


def get_rate_limit_wait_seconds(data):
    headers = data.get("metadata", {}).get("headers", {})
    if not headers:
        headers = data.get("error", {}).get("metadata", {}).get("headers", {})
    reset_ms = headers.get("X-RateLimit-Reset")

    if reset_ms:
        try:
            reset_seconds = int(reset_ms) / 1000
            return max(OPENROUTER_DELAY_SECONDS, min(reset_seconds - time.time() + 2, 90))
        except ValueError:
            pass

    return OPENROUTER_DELAY_SECONDS * 2


def get_openrouter_error_code(data):
    error = data.get("error", data)
    if isinstance(error, dict):
        return error.get("code")
    return None


def should_retry_openrouter(response, data):
    error_code = get_openrouter_error_code(data)
    return response.status_code in TRANSIENT_OPENROUTER_CODES or error_code in TRANSIENT_OPENROUTER_CODES


def is_moderation_blocked(response, data):
    if response.status_code != 403:
        return False

    error = data.get("error", data)
    if not isinstance(error, dict):
        return False

    message = error.get("message", "").lower()
    reasons = error.get("metadata", {}).get("reasons", [])
    reasons_text = " ".join(str(reason).lower() for reason in reasons)
    return "moderation" in message or "sexual/minors" in reasons_text


def get_missing_schema_column(error):
    code = None
    message = str(error)

    for value in error.args:
        data = value
        if isinstance(value, str):
            try:
                data = ast.literal_eval(value)
            except (ValueError, SyntaxError):
                data = None

        if isinstance(data, dict):
            code = data.get("code")
            message = data.get("message", message)
            break

    if code != "PGRST204" and "PGRST204" not in message:
        return None

    for column in OPTIONAL_INSERT_COLUMNS:
        if f"'{column}' column" in message or column in message:
            return column

    return None


def parse_review_json(content):
    decoder = json.JSONDecoder()
    content = content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    start = content.find("{")
    if start == -1:
        raise json.JSONDecodeError("No JSON object found", content, 0)

    parsed, _ = decoder.raw_decode(content[start:])
    return parsed


def insert_review(review):
    fallback_review = dict(review)
    missing_columns = []

    while True:
        try:
            supabase.table("reviews").insert(fallback_review).execute()
            if missing_columns:
                log(
                    "Inserted without optional columns: "
                    f"{', '.join(missing_columns)}. Run supabase.sql to store these fields."
                )
            return True
        except Exception as e:
            missing_column = get_missing_schema_column(e)
            if not missing_column or missing_column in missing_columns:
                raise

            missing_columns.append(missing_column)
            log(
                f"Supabase schema is missing optional column '{missing_column}'. "
                "Retrying insert without it."
            )
            fallback_review.pop(missing_column, None)
        fallback_review.pop(missing_column, None)
        supabase.table("reviews").insert(fallback_review).execute()
        return True


def generate_review(title, type_name, genres, cast, rating, overview):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""You are a professional Korean entertainment critic writing for an international audience.
Write an engaging review for:
Title: {title}
Type: {type_name} (drama/movie)
Genres: {genres}
Cast: {cast}
Rating: {rating}
Synopsis: {overview}

Requirements:
- Write the English review in 300-400 words
- Write the Japanese review in natural Japanese in 300-400 Japanese characters
- Engaging intro
- Plot overview (no spoilers)
- Acting analysis
- Why international viewers should watch
- Final verdict

Return JSON only:
{{
  "title_ja": "...",
  "body_en": "...",
  "summary_en": "... (50 words)",
  "body_ja": "...",
  "summary_ja": "... (Japanese, about 80 characters)",
  "tags": ["tag1", "tag2", "tag3"]
}}"""

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}
    }
    
    for attempt in range(1, OPENROUTER_MAX_RETRIES + 1):
        if attempt > 1:
            log(f"Retrying OpenRouter for {title} with {OPENROUTER_MODEL} ({attempt}/{OPENROUTER_MAX_RETRIES})")

        try:
            log(f"Calling OpenRouter for {title} with {OPENROUTER_MODEL} (attempt {attempt}/{OPENROUTER_MAX_RETRIES})")
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            data = response.json()
        except Exception as e:
            log(f"Error calling OpenRouter for {title}: {e}")
            return None

        if response.status_code >= 400 or "choices" not in data:
            error = data.get("error", data)
            log(f"OpenRouter error for {title} with {OPENROUTER_MODEL}: HTTP {response.status_code} - {error}")

            if is_moderation_blocked(response, data):
                return MODERATION_BLOCKED

            if should_retry_openrouter(response, data):
                if attempt < OPENROUTER_MAX_RETRIES:
                    wait_seconds = get_rate_limit_wait_seconds(data)
                    log(f"OpenRouter transient error. Waiting {wait_seconds:.0f} seconds before retrying...")
                    time.sleep(wait_seconds)
                    continue

                if get_openrouter_error_code(data) == 429 or response.status_code == 429:
                    return RATE_LIMITED

            return None

        message = data["choices"][0].get("message", {})
        content = message.get("content")

        if not content:
            log(f"OpenRouter returned empty content for {title}: {message}")
            if attempt < OPENROUTER_MAX_RETRIES:
                time.sleep(OPENROUTER_DELAY_SECONDS)
                continue
            return None

        try:
            return parse_review_json(content)
        except (TypeError, json.JSONDecodeError) as e:
            log(f"Error parsing OpenRouter JSON for {title}: {e}")
            if attempt < OPENROUTER_MAX_RETRIES:
                time.sleep(OPENROUTER_DELAY_SECONDS)
                continue
            return None

    return None

def main():
    log("Starting collection process...")
    # Process TV Dramas
    log("Fetching popular dramas from TMDB...")
    dramas = get_popular_k_content("tv")
    # Process Movies
    log("Fetching popular movies from TMDB...")
    movies = get_popular_k_content("movie")
    
    all_content = [(d, "drama") for d in dramas[:20]] + [(m, "movie") for m in movies[:20]]
    added_count = 0
    
    for item, content_type in all_content:
        if should_stop_for_time_limit():
            break

        tmdb_id = item["id"]
        item_title = item.get("name" if content_type == "drama" else "title")
        
        # Check if already exists
        log(f"Checking existing review for {item_title} ({tmdb_id})...")
        exists = supabase.table("reviews").select("id").eq("tmdb_id", tmdb_id).execute()
        if exists.data:
            log(f"Skipping {item_title} - already exists")
            continue

        if added_count >= MAX_ITEMS_PER_RUN:
            log(f"Reached MAX_ITEMS_PER_RUN={MAX_ITEMS_PER_RUN}. Stopping for this run.")
            break
            
        log(f"Processing {content_type}: {item_title}")
        
        # Get full details
        log(f"Fetching TMDB details for {item_title}...")
        details = get_details(tmdb_id, "tv" if content_type == "drama" else "movie")
        
        title = details.get("name" if content_type == "drama" else "title")
        original_title = details.get("original_name" if content_type == "drama" else "original_title")
        genres = [g["name"] for g in details.get("genres", [])]
        cast = [c["name"] for c in details.get("credits", {}).get("cast", [])[:5]]
        rating = details.get("vote_average")
        overview = details.get("overview")
        release_date = details.get("first_air_date" if content_type == "drama" else "release_date")
        poster_path = details.get("poster_path")
        backdrop_path = details.get("backdrop_path")
        trailer_url = get_trailer_url(details)

        if should_skip_content(title, overview):
            log(f"Skipping {title} - filtered by title or synopsis")
            continue

        if should_skip_genres(genres):
            log(f"Skipping {title} - filtered by genre: {', '.join(genres)}")
            continue
        
        # Generate AI Review
        review_data = generate_review(title, content_type, genres, cast, rating, overview)
        time.sleep(OPENROUTER_DELAY_SECONDS)
        
        if review_data is RATE_LIMITED:
            log("OpenRouter is still rate-limited. Stopping this run and retrying on the next schedule.")
            break

        if review_data is MODERATION_BLOCKED:
            log(f"Skipping {title} - blocked by OpenRouter moderation")
            continue

        if not review_data:
            continue
            
        # Create slug
        slug_title = "".join(c if c.isalnum() else "-" for c in title.lower()).replace("--", "-").strip("-")
        slug = f"{slug_title}-{tmdb_id}"
        
        # Insert into Supabase
        new_review = {
            "title_en": title,
            "title_ja": review_data.get("title_ja"),
            "original_title": original_title,
            "type": content_type,
            "body_en": review_data["body_en"],
            "body_ja": review_data.get("body_ja"),
            "summary_en": review_data["summary_en"],
            "summary_ja": review_data.get("summary_ja"),
            "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            "backdrop_url": f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None,
            "trailer_url": trailer_url,
            "tmdb_id": tmdb_id,
            "genres": genres,
            "cast_members": cast,
            "rating": rating,
            "release_date": release_date,
            "slug": slug,
            "tags": review_data["tags"],
            "is_published": True
        }
        
        try:
            log(f"Inserting {title} into Supabase...")
            insert_review(new_review)
            added_count += 1
            log(f"Successfully added {title}")
        except Exception as e:
            log(f"Error inserting into Supabase: {e}")
            

if __name__ == "__main__":
    main()
