import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const nextIntlPlugin = createNextIntlPlugin();

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

export default nextIntlPlugin(withMDX(nextConfig));