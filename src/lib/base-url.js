export function getBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (!raw) {
    return 'http://localhost:3000';
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  return `https://${raw}`;
}
