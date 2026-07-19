import { reportUriMap } from '@/reports';

/** Canonical report key for WDR engagement quotes (en index: wdr26 → wdr25 content). */
const QUOTE_REPORT_KEY = 'wdr26';

/** CH codes in engagement TSV → canonical chapter slugs. */
const CHAPTER_CODE_TO_CANONICAL_SLUG = {
  CH1: 'chapter-01',
  CH2: 'chapter-02',
  CH3: 'chapter-03',
  CH4: 'chapter-04',
  CH5: 'chapter-05',
  CH6: 'chapter-06',
  CH7: 'chapter-07',
  CH8: 'chapter-08',
};

/** English chapter titles (from reportUriMap). */
export const CHAPTER_TITLES = Object.fromEntries(
  Object.entries(CHAPTER_CODE_TO_CANONICAL_SLUG).map(([chapterCode, canonicalSlug]) => [
    chapterCode,
    reportUriMap[QUOTE_REPORT_KEY]?.chapters?.[canonicalSlug]?.meta?.en?.title || '',
  ])
);

/** "Chapter 01" → "Chapter 1"; leaves scripts like "第02章" unchanged. */
function normalizeChapterPrefix(prefix) {
  if (!prefix || typeof prefix !== 'string') return '';
  return prefix.replace(/(\D)0+(\d+)$/, '$1$2');
}

function getReportChapterMeta(chapterCode, locale) {
  const key = (chapterCode || '').trim().toUpperCase();
  const canonicalSlug = CHAPTER_CODE_TO_CANONICAL_SLUG[key];
  if (!canonicalSlug) return null;

  const chapter = reportUriMap[QUOTE_REPORT_KEY]?.chapters?.[canonicalSlug];
  return chapter?.meta?.[locale] || chapter?.meta?.en || null;
}

/** CH1 -> "Chapter 1", CH2 -> "Chapitre 2" (fr), etc. */
export function formatChapterLabel(chapterCode, locale = 'en') {
  if (!chapterCode || typeof chapterCode !== 'string') return '';
  const key = chapterCode.trim().toUpperCase();
  const prefix = getReportChapterMeta(key, locale)?.prefix;
  if (prefix) return normalizeChapterPrefix(prefix);

  const m = key.match(/^CH(\d+)$/i);
  return m ? `Chapter ${m[1]}` : chapterCode;
}

export function getChapterMeta(chapterCode, locale = 'en') {
  const key = (chapterCode || '').trim().toUpperCase();
  const meta = getReportChapterMeta(key, locale);
  return {
    label: formatChapterLabel(key, locale),
    title: meta?.title || '',
    thumbnail: meta?.thumbnail,
    thumbnailOverlay: meta?.thumbnailOverlay || 'red',
  };
}

/** Locale-aware href for the chapter page referenced by a quote (CH1–CH8). */
export function getQuoteChapterHref(chapterCode, locale) {
  const key = (chapterCode || '').trim().toUpperCase();
  const canonicalSlug = CHAPTER_CODE_TO_CANONICAL_SLUG[key];
  if (!canonicalSlug) return null;

  const reportSlug = reportUriMap[QUOTE_REPORT_KEY]?.languages?.[locale];
  const chapterSlug =
    reportUriMap[QUOTE_REPORT_KEY]?.chapters?.[canonicalSlug]?.languages?.[locale];
  if (!reportSlug || !chapterSlug) return null;

  return {
    pathname: '/reports/[report]/[chapter]',
    params: { report: reportSlug, chapter: chapterSlug },
  };
}
