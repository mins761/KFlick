import os
import requests
import time
import json
from urllib.parse import urlparse
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "").strip()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
OPENROUTER_DELAY_SECONDS = int(os.getenv("OPENROUTER_DELAY_SECONDS", "9"))
OPENROUTER_MAX_RETRIES = int(os.getenv("OPENROUTER_MAX_RETRIES", "3"))


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

SKIP_TITLE_KEYWORDS = [
    "mother's friend",
    "young sister",
    "special treatment",
    "practice room",
]


def should_skip_content(title, overview):
    text = f"{title or ''} {overview or ''}".lower()
    return any(keyword in text for keyword in SKIP_TITLE_KEYWORDS)


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
        "append_to_response": "credits,images"
    }
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()

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
- 300-400 words
- Engaging intro
- Plot overview (no spoilers)
- Acting analysis
- Why international viewers should watch
- Final verdict

Return JSON only:
{{
  "body_en": "...",
  "summary_en": "... (50 words)",
  "tags": ["tag1", "tag2", "tag3"]
}}"""

    payload = {
        "model": "meta-llama/llama-3.3-70b-instruct:free",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}
    }
    
    for attempt in range(1, OPENROUTER_MAX_RETRIES + 1):
        if attempt > 1:
            print(f"Retrying OpenRouter for {title} ({attempt}/{OPENROUTER_MAX_RETRIES})")

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            data = response.json()
        except Exception as e:
            print(f"Error calling OpenRouter for {title}: {e}")
            return None

        if response.status_code >= 400 or "choices" not in data:
            error = data.get("error", data)
            print(f"OpenRouter error for {title}: HTTP {response.status_code} - {error}")

            if response.status_code == 429 and attempt < OPENROUTER_MAX_RETRIES:
                wait_seconds = get_rate_limit_wait_seconds(data)
                print(f"Rate limited. Waiting {wait_seconds:.0f} seconds before retrying...")
                time.sleep(wait_seconds)
                continue

            return None

        content = data["choices"][0]["message"]["content"]
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error parsing OpenRouter JSON for {title}: {e}")
            return None

    return None

def main():
    print("Starting collection process...")
    # Process TV Dramas
    dramas = get_popular_k_content("tv")
    # Process Movies
    movies = get_popular_k_content("movie")
    
    all_content = [(d, "drama") for d in dramas[:20]] + [(m, "movie") for m in movies[:20]]
    
    for item, content_type in all_content:
        tmdb_id = item["id"]
        
        # Check if already exists
        exists = supabase.table("reviews").select("id").eq("tmdb_id", tmdb_id).execute()
        if exists.data:
            print(f"Skipping {item.get('name' if content_type == 'drama' else 'title')} - already exists")
            continue
            
        print(f"Processing {content_type}: {item.get('name' if content_type == 'drama' else 'title')}")
        
        # Get full details
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

        if should_skip_content(title, overview):
            print(f"Skipping {title} - filtered by title or synopsis")
            continue
        
        # Generate AI Review
        review_data = generate_review(title, content_type, genres, cast, rating, overview)
        time.sleep(OPENROUTER_DELAY_SECONDS)
        
        if not review_data:
            continue
            
        # Create slug
        slug_title = "".join(c if c.isalnum() else "-" for c in title.lower()).replace("--", "-").strip("-")
        slug = f"{slug_title}-{tmdb_id}"
        
        # Insert into Supabase
        new_review = {
            "title_en": title,
            "original_title": original_title,
            "type": content_type,
            "body_en": review_data["body_en"],
            "summary_en": review_data["summary_en"],
            "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            "backdrop_url": f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None,
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
            supabase.table("reviews").insert(new_review).execute()
            print(f"Successfully added {title}")
        except Exception as e:
            print(f"Error inserting into Supabase: {e}")
            

if __name__ == "__main__":
    main()
