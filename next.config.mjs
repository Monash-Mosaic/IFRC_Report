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
      [
        'rehype-toc',
        {
          headings: ['h1'],
          cssClasses: {
            toc: 'toc',
            link: 'toc-link',
          },
          // Use the custom marker
          nav: true,
        },
      ],
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
};

export default nextIntlPlugin(withMDX(nextConfig));
