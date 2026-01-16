import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const nextIntlPlugin = createNextIntlPlugin();

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      ['rehype-slug', {}],
      [
        'rehype-autolink-headings',
        {
          behavior: 'wrap',
          content: {
            type: 'text',
            value: ' 🔗',
          },
        },
      ],
      ['@stefanprobst/rehype-extract-toc', {}],
      ['@stefanprobst/rehype-extract-toc/mdx', {}],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure testing works with ESM packages
  // ref: https://github.com/vercel/next.js/issues/40183#issuecomment-3063588870
  transpilePackages: ['next-intl', 'use-intl'],
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async headers() {
    return [
      {
        // Cache all pages on the CDN for 6 hours
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=21600, stale-while-revalidate=60',
          },
        ],
      },
      {
        // Cache images and videos on the CDN for 6 hours
        source: '/:path*\\.(?:avif|gif|jpe?g|png|svg|webp|mp4|webm|m3u8|ts)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=21600, s-maxage=21600, immutable',
          },
        ],
      },
    ];
  },
};

export default nextIntlPlugin(withMDX(nextConfig));
