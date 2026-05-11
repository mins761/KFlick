import { supabase } from '@/lib/supabase';
import { Review } from '@/types';
import Image from 'next/image';
import RatingStars from '@/components/RatingStars';
import ReactMarkdown from 'react-markdown';
import AdBanner from '@/components/AdBanner';
import ReviewCard from '@/components/ReviewCard';
import { notFound } from 'next/navigation';
import { getReviewText, Locale } from '@/lib/i18n';

interface ReviewDetailProps {
  params: { slug: string };
  type: 'drama' | 'movie';
  locale?: Locale;
}

export default async function ReviewDetail({ params, type, locale = 'en' }: ReviewDetailProps) {
  const { slug } = params;

  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('slug', slug)
    .eq('type', type)
    .single();

  if (!review) {
    notFound();
  }

  const { data: related } = await supabase
    .from('reviews')
    .select('*')
    .eq('type', type)
    .neq('slug', slug)
    .limit(3);

  const item = review as Review;
  const text = getReviewText(item, locale);

  return (
    <div className="pb-20">
      {/* Hero Backdrop */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={item.backdrop_url || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000&auto=format&fit=crop'}
          alt={text.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kflick-dark via-kflick-dark/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight">
              {text.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <span className="text-kflick-light/60">{item.original_title}</span>
              <span className="text-kflick-light/40">•</span>
              <span className="text-kflick-light/60">{item.release_date?.split('-')[0]}</span>
              <span className="text-kflick-light/40">•</span>
              <RatingStars rating={item.rating} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Review Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-invert max-w-none prose-red">
              <div className="text-kflick-light/80 leading-relaxed space-y-6">
                <ReactMarkdown>
                  {text.body}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-2">
              {item.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-kflick-gray border border-kflick-border text-kflick-light/60 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <AdBanner />
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-kflick-border shadow-2xl">
              <Image
                src={item.poster_url || 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=2000&auto=format&fit=crop'}
                alt={text.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-kflick-gray rounded-2xl p-6 border border-kflick-border">
              <h3 className="text-white font-bold mb-4 border-b border-kflick-border pb-2">Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-kflick-light/40 uppercase text-[10px] tracking-wider mb-1">Cast</p>
                  <p className="text-kflick-light/80">{item.cast_members?.join(', ')}</p>
                </div>
                <div>
                  <p className="text-kflick-light/40 uppercase text-[10px] tracking-wider mb-1">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {item.genres?.map(g => (
                      <span key={g} className="text-kflick-light/80">{g}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-kflick-light/40 uppercase text-[10px] tracking-wider mb-1">Release Date</p>
                  <p className="text-kflick-light/80">{item.release_date}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6">Related {type === 'drama' ? 'Dramas' : 'Movies'}</h3>
              <div className="space-y-6">
                {(related as Review[])?.map((rel) => {
                  const relatedText = getReviewText(rel, locale);
                  return (
                    <ReviewCard
                      key={rel.id}
                      {...{
                        id: rel.id,
                        title: relatedText.title,
                        type: rel.type,
                        rating: rel.rating,
                        genres: rel.genres,
                        summary: relatedText.summary,
                        posterUrl: rel.poster_url,
                        slug: rel.slug,
                        locale
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
