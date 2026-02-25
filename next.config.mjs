import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextIntlPlugin = createNextIntlPlugin();

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      ['rehype-slug', {}],
      [
        'rehype-autolink-headings',
        {
          behavior: 'wrap',
        },
      ],
      ['@stefanprobst/rehype-extract-toc', {}],
      ['@stefanprobst/rehype-extract-toc/mdx', {}],
      // ['rehype-custom-footnotes', {}],
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
  images: {
    contentDispositionType: 'inline',
    minimumCacheTTL: 14400, // 4 hours
  },
};

export default nextIntlPlugin(withMDX(nextConfig));

// Workaround this issues: https://github.com/opennextjs/opennextjs-cloudflare/issues/923
if (process.env.ENVIRONMENT === 'development') {
  initOpenNextCloudflareForDev();
}
