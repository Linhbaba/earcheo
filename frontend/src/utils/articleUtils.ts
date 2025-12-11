import { format, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';

/**
 * Format date for display
 */
export const formatArticleDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'd. MMMM yyyy', { locale: cs });
};

/**
 * Format date for datetime attribute (ISO)
 */
export const formatDateISO = (dateString: string): string => {
  return parseISO(dateString).toISOString();
};

/**
 * Calculate reading time from content
 */
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Generate article URL
 */
export const getArticleUrl = (slug: string): string => {
  return `/magazin/${slug}`;
};

/**
 * Generate full article URL for sharing
 */
export const getFullArticleUrl = (slug: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://earcheo.cz';
  return `${baseUrl}/magazin/${slug}`;
};

/**
 * Copy URL to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Share via Web Share API (mobile)
 */
export const shareArticle = async (title: string, url: string): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Check if Web Share API is available
 */
export const canShare = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.share;
};
