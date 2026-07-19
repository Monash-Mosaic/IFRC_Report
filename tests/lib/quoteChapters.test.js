import {
  formatChapterLabel,
  getChapterMeta,
  getQuoteChapterHref,
  CHAPTER_TITLES,
} from '@/lib/quoteChapters';
import { reportUriMap } from '@/reports';

const quoteReportKey = 'wdr26';
const quoteReport = reportUriMap[quoteReportKey];

describe('quoteChapters', () => {
  describe('formatChapterLabel', () => {
    it.each([
      ['CH1', 'Chapter 1'],
      ['ch8', 'Chapter 8'],
      ['  CH3  ', 'Chapter 3'],
      ['', ''],
      [null, ''],
      ['INVALID', 'INVALID'],
    ])('formats %p as %p', (input, expected) => {
      expect(formatChapterLabel(input)).toBe(expected);
    });
  });

  describe('getChapterMeta', () => {
    it('returns label, title, and thumbnail metadata for known chapters', () => {
      const meta = getChapterMeta('CH1', 'en');
      expect(meta.label).toBe('Chapter 1');
      expect(meta.title).toBe(CHAPTER_TITLES.CH1);
      expect(meta.thumbnail).toMatch(/Chapter1\.webp$/);
      expect(meta.thumbnailOverlay).toBe('red');
    });

    it('returns localized title for French locale', () => {
      const meta = getChapterMeta('CH1', 'fr');
      expect(meta.label).toBe('Chapitre 1');
      expect(meta.title).toBe(
        reportUriMap[quoteReportKey].chapters['chapter-01'].meta.fr.title
      );
      expect(
        reportUriMap[quoteReportKey].chapters['chapter-01'].meta.fr.prefix
      ).toBe('Chapitre 01');
    });

    it('returns empty title and default overlay for unknown chapters', () => {
      const meta = getChapterMeta('CH99', 'en');
      expect(meta.title).toBe('');
      expect(meta.thumbnail).toBeUndefined();
      expect(meta.thumbnailOverlay).toBe('red');
    });
  });

  describe('getQuoteChapterHref', () => {
    const locales = Object.keys(quoteReport?.languages || {});

    it.each(locales)('builds href for CH1 in locale %s when mappings exist', (locale) => {
      const href = getQuoteChapterHref('CH1', locale);
      const reportSlug = quoteReport.languages[locale];
      const chapterSlug = quoteReport.chapters?.['chapter-01']?.languages?.[locale];

      if (reportSlug && chapterSlug) {
        expect(href).toEqual({
          pathname: '/reports/[report]/[chapter]',
          params: { report: reportSlug, chapter: chapterSlug },
        });
      } else {
        expect(href).toBeNull();
      }
    });

    it('returns null for invalid chapter codes', () => {
      expect(getQuoteChapterHref('CH99', 'en')).toBeNull();
      expect(getQuoteChapterHref('', 'en')).toBeNull();
    });

    it('returns null when locale has no report slug', () => {
      expect(getQuoteChapterHref('CH1', 'xx')).toBeNull();
    });
  });
});
