CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  original_title TEXT,
  type TEXT DEFAULT 'drama', -- drama | movie
  body_en TEXT NOT NULL,
  summary_en TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  tmdb_id INTEGER UNIQUE,
  genres TEXT[],
  cast_members TEXT[],
  rating DECIMAL(3,1),
  release_date TEXT,
  slug TEXT UNIQUE,
  tags TEXT[],
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 설정
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"
ON reviews FOR SELECT TO anon
USING (is_published = true);
