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

export const CHAPTER_TITLES = {
  CH1: 'Crisis Chaos and Confusion',
  CH2: 'Trust, Perception and Harmful Information',
  CH3: 'Detecting and Understanding Harmful Information',
  CH4: 'Protecting Reputation and Maintaining Trust',
  CH5: 'Regulation and Rights in the Information Environment',
  CH6: 'Community Voices and Lived Experiences',
  CH7: 'National Society Case Studies',
  CH8: 'Recommendations and the Path Forward',
};

/** Thumbnails and overlay tints from reports/[report]/page.js chapter entries. */
export const CHAPTER_THUMBNAILS = {
  CH1: { thumbnail: '/wdr25/chapters/Chapter1.webp', thumbnailOverlay: 'red' },
  CH2: { thumbnail: '/wdr25/chapters/Chapter2.webp', thumbnailOverlay: 'red' },
  CH3: { thumbnail: '/wdr25/chapters/Chapter3.webp', thumbnailOverlay: 'blue' },
  CH4: { thumbnail: '/wdr25/chapters/Chapter4.webp', thumbnailOverlay: 'red' },
  CH5: { thumbnail: '/wdr25/chapters/Chapter5.webp', thumbnailOverlay: 'red' },
  CH6: { thumbnail: '/wdr25/chapters/Chapter6.webp', thumbnailOverlay: 'red' },
  CH7: { thumbnail: '/wdr25/chapters/Chapter7.webp', thumbnailOverlay: 'red' },
  CH8: { thumbnail: '/wdr25/chapters/Chapter8.webp', thumbnailOverlay: 'red' },
};

/** CH1 -> "Chapter 1", CH2 -> "Chapter 2", etc. */
export function formatChapterLabel(chapterCode) {
  if (!chapterCode || typeof chapterCode !== 'string') return '';
  const m = chapterCode.trim().match(/^CH(\d+)$/i);
  return m ? `Chapter ${m[1]}` : chapterCode;
}

export function getChapterMeta(chapterCode) {
  const key = (chapterCode || '').trim().toUpperCase();
  return {
    label: formatChapterLabel(key),
    title: CHAPTER_TITLES[key] || '',
    thumbnail: CHAPTER_THUMBNAILS[key]?.thumbnail,
    thumbnailOverlay: CHAPTER_THUMBNAILS[key]?.thumbnailOverlay || 'red',
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
