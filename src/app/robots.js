import { getBaseUrl } from '@/lib/base-url';

/**
 * 
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  const host = new URL('sitemap.xml', getBaseUrl());
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: host,
  }
}