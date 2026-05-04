import ReviewDetail from '@/components/ReviewDetail';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: review } = await supabase
    .from('reviews')
    .select('title_en, summary_en, poster_url')
    .eq('slug', params.slug)
    .single();

  if (!review) return { title: 'Not Found' };

  return {
    title: `${review.title_en} Review | KFlick`,
    description: review.summary_en,
    openGraph: {
      images: [review.poster_url],
    },
  };
}

export default function MoviePage({ params }: { params: { slug: string } }) {
  return <ReviewDetail params={params} type="movie" />;
}
