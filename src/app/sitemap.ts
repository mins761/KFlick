import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kflick.vercel.app';

  // Fetch all reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('slug, type, updated_at')
    .eq('is_published', true);

  const reviewUrls = (reviews || []).map((review) => ({
    url: `${baseUrl}/${review.type}/${review.slug}`,
    lastModified: new Date(review.updated_at || new Date()),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    ...reviewUrls,
  ];
}
