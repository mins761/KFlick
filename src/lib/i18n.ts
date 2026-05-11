import { Review } from '@/types';

export type Locale = 'en' | 'ja';

export function getLocale(value?: string | string[]): Locale {
  const lang = Array.isArray(value) ? value[0] : value;
  return lang === 'ja' ? 'ja' : 'en';
}

export function withLocale(path: string, locale: Locale) {
  return locale === 'ja' ? `${path}?lang=ja` : path;
}

export function getReviewText(review: Review, locale: Locale) {
  return {
    title: locale === 'ja' && review.title_ja ? review.title_ja : review.title_en,
    body: locale === 'ja' && review.body_ja ? review.body_ja : review.body_en,
    summary: locale === 'ja' && review.summary_ja ? review.summary_ja : review.summary_en,
  };
}
