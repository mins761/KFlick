import Link from 'next/link';
import Image from 'next/image';
import RatingStars from './RatingStars';
import { Locale, withLocale } from '@/lib/i18n';

interface HeroSectionProps {
  title: string;
  type: 'drama' | 'movie';
  rating: number;
  genres: string[];
  backdropUrl: string;
  slug: string;
  trailerUrl?: string | null;
  locale?: Locale;
}

export default function HeroSection({
  title,
  type,
  rating,
  genres,
  backdropUrl,
  slug,
  trailerUrl,
  locale = 'en',
}: HeroSectionProps) {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src={backdropUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000&auto=format&fit=crop'}
        alt={title}
        fill
        priority
        className="object-cover"
      />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-kflick-dark via-kflick-dark/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-kflick-dark via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-kflick-red text-white text-xs font-bold uppercase rounded-full">
              {type === 'drama' ? 'K-Drama' : 'K-Movie'}
            </span>
            <span className="text-kflick-light/60 text-sm font-medium">Trending Now</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            {title}
          </h1>
          
          <div className="flex items-center gap-6 mb-8">
            <RatingStars rating={rating} />
            <div className="flex gap-2">
              {genres.map((genre) => (
                <span key={genre} className="text-sm text-kflick-light/80">
                  • {genre}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link
              href={withLocale(`/${type}/${slug}`, locale)}
              className="px-8 py-3 bg-kflick-red text-white font-bold rounded-md hover:bg-kflick-red/90 transition-all transform hover:scale-105"
            >
              Read Review
            </Link>
            {trailerUrl ? (
              <a
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white/10 text-white font-bold rounded-md backdrop-blur-md hover:bg-white/20 transition-all"
              >
                Watch Trailer
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
