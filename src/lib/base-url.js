export function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ??
              process.env.NEXT_PUBLIC_VERCEL_URL ??
              process.env.VERCEL_URL ??
              process.env.CF_PAGES_URL;
  if (!raw) {
    const host = process.env.HOST ?? 'localhost';
    const port = process.env.PORT ?? '3000';
    return `http://${host}:${port}`;
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/\/$/, '');
  }
  return `https://${raw}`;
}
