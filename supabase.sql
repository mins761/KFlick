CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  original_title TEXT,
  type TEXT DEFAULT 'drama', -- drama | movie
  body_en TEXT NOT NULL,
  summary_en TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  tmdb_id INTEGER UNIQUE,
  genres TEXT[],
  cast_members TEXT[],
  rating DECIMAL(3,1),
  release_date TEXT,
  slug TEXT UNIQUE,
  tags TEXT[],
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS trailer_url TEXT;

NOTIFY pgrst, 'reload schema';

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_reviews_updated_at ON reviews;
CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- RLS settings
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON reviews;
CREATE POLICY "Public read"
ON reviews FOR SELECT TO anon
USING (is_published = true);
