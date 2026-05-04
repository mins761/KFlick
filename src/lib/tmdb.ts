const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY || '');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // 1 hour caching
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.statusText}`);
  }

  return res.json();
}

export const getPopularKDramas = () => {
  return fetchTMDB('/discover/tv', {
    with_origin_country: 'KR',
    sort_by: 'popularity.desc',
  });
};

export const getPopularKMovies = () => {
  return fetchTMDB('/discover/movie', {
    with_origin_country: 'KR',
    sort_by: 'popularity.desc',
  });
};

export const getTVDetails = (id: string | number) => {
  return fetchTMDB(`/tv/${id}`, {
    append_to_response: 'credits,images',
  });
};

export const getMovieDetails = (id: string | number) => {
  return fetchTMDB(`/movie/${id}`, {
    append_to_response: 'credits,images',
  });
};

export const getImageUrl = (path: string | null) => {
  return path ? `${IMAGE_BASE_URL}${path}` : null;
};

export const getBackdropUrl = (path: string | null) => {
  return path ? `${BACKDROP_BASE_URL}${path}` : null;
};
