/**
 * Media loader for per-locale/report/chapter recordings.
 * Priority: S3 (if configured) -> local public fallback.
 * 
 * Expected JSON shape:
 * {
 *   "audio": [{ id, name, duration, url }],
 *   "videos": [{ id, name, duration, url, thumbnail }]
 * }
 */

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Build the media index URL based on identifiers.
 * S3 base should be provided via NEXT_PUBLIC_MEDIA_BASE_URL, e.g.
 * https://my-bucket.s3.amazonaws.com/media-index
 */
export function buildMediaIndexUrls({ locale, report, chapter }) {
  const parts = [locale, report, chapter];
  const relPath = parts.map(encodeURIComponent).join('/') + '.json';

  const s3Base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const urls = [];
  if (s3Base) {
    urls.push(`${s3Base.replace(/\/$/, '')}/${relPath}`);
  }
  // local fallback served from public/
  urls.push(`/media-index/${relPath}`);
  return urls;
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, { ...rest, signal: controller.signal, cache: 'no-store' });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function loadMediaIndex({ locale, report, chapter }) {
  const urls = buildMediaIndexUrls({ locale, report, chapter });
  let lastErr;
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const data = await res.json();
        return normalizeMediaIndex(data);
      }
      lastErr = new Error(`Failed ${res.status} ${url}`);
    } catch (e) {
      lastErr = e;
    }
  }
  console.warn('Media index not found for', { locale, report, chapter, error: lastErr?.message });
  return { audio: [], videos: [] };
}

function normalizeMediaIndex(data) {
  const normList = (arr = []) =>
    arr.map((it, i) => ({
      id: it.id ?? `item-${i + 1}`,
      name: it.name ?? it.title ?? `Item ${i + 1}`,
      duration: it.duration ?? null,
      url: it.url ?? it.src ?? '',
      thumbnail: it.thumbnail ?? it.thumb ?? null,
    }));
  return {
    audio: normList(data.audio),
    videos: normList(data.videos),
  };
}
