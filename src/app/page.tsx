import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/HeroSection';
import ReviewCard from '@/components/ReviewCard';
import AdBanner from '@/components/AdBanner';
import { Review } from '@/types';
import { getLocale, getReviewText } from '@/lib/i18n';

export const revalidate = 3600;

export default async function Home({ searchParams }: { searchParams?: { lang?: string } }) {
  const locale = getLocale(searchParams?.lang);
  // Fetch featured review (trending)
  const { data: trending } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1);

  // Fetch latest movies
  const { data: latestMovies } = await supabase
    .from('reviews')
    .select('*')
    .eq('type', 'movie')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(4);

  // Fetch latest dramas
  const { data: latestDramas } = await supabase
    .from('reviews')
    .select('*')
    .eq('type', 'drama')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(4);

  const heroItem = trending?.[0] as Review | undefined;
  const heroText = heroItem ? getReviewText(heroItem, locale) : null;

  return (
    <div className="pb-20">
      {heroItem ? (
        <HeroSection
          title={heroText?.title || heroItem.title_en}
          type={heroItem.type}
          rating={heroItem.rating}
          genres={heroItem.genres}
          backdropUrl={heroItem.backdrop_url}
          slug={heroItem.slug}
          trailerUrl={heroItem.trailer_url}
          locale={locale}
        />
      ) : (
        <div className="h-[60vh] flex flex-col items-center justify-center bg-kflick-gray border-b border-kflick-border">
          <h1 className="text-4xl font-black text-kflick-red mb-4">WELCOME TO KFLICK</h1>
          <p className="text-kflick-light/40">Our latest reviews are coming soon!</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-kflick-red">🔥</span> Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(latestDramas as Review[])?.map((item) => {
              const text = getReviewText(item, locale);
              return (
                <ReviewCard
                  key={item.id}
                  id={item.id}
                  title={text.title}
                  type={item.type}
                  rating={item.rating}
                  genres={item.genres}
                  summary={text.summary}
                  posterUrl={item.poster_url}
                  slug={item.slug}
                  locale={locale}
                />
              );
            })}
          </div>
        </section>

        <AdBanner />

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-kflick-red">🎬</span> Latest Movies
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(latestMovies as Review[])?.map((item) => {
              const text = getReviewText(item, locale);
              return (
                <ReviewCard
                  key={item.id}
                  id={item.id}
                  title={text.title}
                  type={item.type}
                  rating={item.rating}
                  genres={item.genres}
                  summary={text.summary}
                  posterUrl={item.poster_url}
                  slug={item.slug}
                  locale={locale}
                />
              );
            })}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-kflick-gray rounded-2xl p-8 md:p-12 border border-kflick-border text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-kflick-red"></div>
          <h2 className="text-3xl font-black mb-4">Stay in the Loop</h2>
          <p className="text-kflick-light/60 mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter and never miss a review of the latest K-Dramas and Movies.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-kflick-dark border border-kflick-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-kflick-red transition-colors"
              required
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-kflick-gold text-kflick-dark font-bold rounded-md hover:bg-kflick-gold/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
