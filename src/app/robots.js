import { getBaseUrl } from '@/lib/base-url';
import { routing } from '@/i18n/routing';
import { isLocaleReleased } from '@/reports';

/**
 * 
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  const host = new URL('sitemap.xml', getBaseUrl());
  const unreleasedLocales = routing.locales.filter((locale) => !isLocaleReleased(locale));
  const disallow = [
    '/coming-soon',
    ...unreleasedLocales.flatMap((locale) => [
      `/${locale}`,
      `/${locale}/coming-soon`,
    ]),
  ];
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: host,
  }
}