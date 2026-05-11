export interface Review {
  id: string;
  title_en: string;
  title_ja?: string | null;
  original_title: string;
  type: 'drama' | 'movie';
  body_en: string;
  body_ja?: string | null;
  summary_en: string;
  summary_ja?: string | null;
  poster_url: string;
  backdrop_url: string;
  trailer_url?: string | null;
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
