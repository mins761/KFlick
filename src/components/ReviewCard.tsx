import Link from 'next/link';
import Image from 'next/image';
import RatingStars from './RatingStars';
import { Locale, withLocale } from '@/lib/i18n';

interface ReviewCardProps {
  id: string | number;
  title: string;
  type: 'drama' | 'movie';
  rating: number;
  genres: string[];
  summary: string;
  posterUrl: string;
  slug: string;
  locale?: Locale;
}

export default function ReviewCard({
  title,
  type,
  rating,
  genres,
  summary,
  posterUrl,
  slug,
  locale = 'en',
}: ReviewCardProps) {
  const href = withLocale(`/${type}/${slug}`, locale);

  return (
    <Link href={href} className="group block">
      <div className="bg-kflick-gray rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:-translate-y-1 border border-kflick-border">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=2000&auto=format&fit=crop'}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kflick-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
              type === 'drama' ? 'bg-kflick-red text-white' : 'bg-kflick-gold text-kflick-dark'
            }`}>
              {type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {genres.slice(0, 2).map((genre) => (
              <span key={genre} className="px-2 py-0.5 text-[10px] bg-kflick-border text-kflick-light/60 rounded-full">
                {genre}
              </span>
            ))}
          </div>
          
          <h3 className="text-kflick-light font-bold text-sm mb-2 line-clamp-1 group-hover:text-kflick-red transition-colors">
            {title}
          </h3>
          
          <div className="mb-3">
            <RatingStars rating={rating} />
          </div>
          
          <p className="text-kflick-light/40 text-xs line-clamp-2 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </Link>
  );
}
