import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import path from 'path';
import { fileURLToPath } from 'url';
import rehypeRemoveFootnoteHeading from './rehype-remove-footnote-heading.js';

const nextIntlPlugin = createNextIntlPlugin();

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      ['remark-gfm', { firstLineBlank: true }], // Add this for footnote support
    ],
    rehypePlugins: [
      ['rehype-slug', {}],
      [
        'rehype-autolink-headings',
        {
          behavior: 'wrap',
          content: {
            type: 'text',
            value: '',
          },
        },
      ],
      ['@stefanprobst/rehype-extract-toc', {}],
      ['@stefanprobst/rehype-extract-toc/mdx', {}],
      () => (tree) => {
        visit(tree, 'element', (node) => {
          if (
            node.properties?.dataFootnotes === true ||
            node.properties?.className?.includes('footnotes')
          ) {
            if (node.children[0]?.tagName === 'h2') {
              node.children.shift();
            }
          }
        });
      },
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
