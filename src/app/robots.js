

/**
 * 
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${host}/sitemap.xml`,
  }
}