export interface Review {
  id: string;
  title_en: string;
  original_title: string;
  type: 'drama' | 'movie';
  body_en: string;
  summary_en: string;
  poster_url: string;
  backdrop_url: string;
  tmdb_id: number;
  genres: string[];
  cast_members: string[];
  rating: number;
  release_date: string;
  slug: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}
