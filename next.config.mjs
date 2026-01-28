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
  output: 'standalone',
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

initOpenNextCloudflareForDev();
