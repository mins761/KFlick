import { supabase } from '@/lib/supabase';
import ReviewCard from '@/components/ReviewCard';
import { Review } from '@/types';

export const revalidate = 3600;

export default async function CategoryPage({ params }: { params: { type: string } }) {
  const { type } = params;

  let reviews: Review[] | null = null;

  if (type === 'drama' || type === 'movie') {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('type', type)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(20);

    reviews = data as Review[] | null;
  } else if (type === 'top-rated') {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .order('rating', { ascending: false })
      .limit(20);

    reviews = data as Review[] | null;
  } else if (type === 'new') {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(20);

    reviews = data as Review[] | null;
  }

  const title = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-black mb-12 text-white">
        Explore <span className="text-kflick-red">{title}</span>
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {reviews?.map((item) => (
          <ReviewCard
            key={item.id}
            id={item.id}
            title={item.title_en}
            type={item.type}
            rating={item.rating}
            genres={item.genres}
            summary={item.summary_en}
            posterUrl={item.poster_url}
            slug={item.slug}
          />
        ))}
      </div>

      {(!reviews || reviews.length === 0) && (
        <div className="text-center py-20">
          <p className="text-kflick-light/40">No reviews found in this category.</p>
        </div>
      )}
    </div>
  );
}
