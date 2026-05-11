import ReviewDetail from '@/components/ReviewDetail';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { getLocale, getReviewText } from '@/lib/i18n';
import { Review } from '@/types';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { lang?: string };
}): Promise<Metadata> {
  const locale = getLocale(searchParams?.lang);
  const { data: review } = await supabase
    .from('reviews')
    .select('title_en, title_ja, summary_en, summary_ja, poster_url')
    .eq('slug', params.slug)
    .single();

  if (!review) return { title: 'Not Found' };
  const text = getReviewText(review as Review, locale);

  return {
    title: `${text.title} Review | KFlick`,
    description: text.summary,
    openGraph: {
      images: [review.poster_url],
    },
  };
}

export default function MoviePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { lang?: string };
}) {
  return <ReviewDetail params={params} type="movie" locale={getLocale(searchParams?.lang)} />;
}
