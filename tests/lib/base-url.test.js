import { getBaseUrl } from '@/lib/base-url';

describe('getBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    delete process.env.VERCEL_URL;
    delete process.env.CF_PAGES_URL;
    delete process.env.HOST;
    delete process.env.PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to localhost when no URL env vars are set', () => {
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });

  it('uses HOST and PORT when falling back', () => {
    process.env.HOST = '127.0.0.1';
    process.env.PORT = '4000';
    expect(getBaseUrl()).toBe('http://127.0.0.1:4000');
  });

  it.each([
    ['NEXT_PUBLIC_SITE_URL', 'https://example.com'],
    ['NEXT_PUBLIC_VERCEL_URL', 'https://vercel.example.com'],
    ['VERCEL_URL', 'https://vercel-internal.example.com'],
    ['CF_PAGES_URL', 'https://pages.example.com'],
  ])('prefers %s when set', (key, value) => {
    process.env[key] = value;
    expect(getBaseUrl()).toBe(value);
  });

  it('strips trailing slash from absolute URLs', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/';
    expect(getBaseUrl()).toBe('https://example.com');
  });

  it('prefixes https when value has no protocol', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'my-site.example.com';
    expect(getBaseUrl()).toBe('https://my-site.example.com');
  });

  it('preserves http protocol when explicitly set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://local.dev';
    expect(getBaseUrl()).toBe('http://local.dev');
  });
});
