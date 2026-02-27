import { reportUriMap, isReportReleased, getVisibleReports } from '@/reports';

describe('reportUriMap', () => {
  it('builds report-level mappings for all locales', () => {
    const expectedLocales = ['ar', 'en', 'es', 'fr', 'ru', 'zh'];

    expectedLocales.forEach((locale) => {
      expect(reportUriMap.uri[locale]).toBeDefined();
      expect(reportUriMap.uri[locale].wdr25).toBe('wdr25');
    });

    expect(reportUriMap.wdr25.languages).toMatchObject({
      ar: 'wdr25',
      en: 'wdr25',
      es: 'wdr25',
      fr: 'wdr25',
      ru: 'wdr25',
      zh: 'wdr25',
    });
  });

  it('builds chapter-level mappings with reverse lookups', () => {
    const chapter = reportUriMap.wdr25.chapters['chapter-02'];

    expect(chapter.number).toBe(2);
    // chapter-02 only exists in English; other locales only have synthesis
    expect(chapter.languages).toMatchObject({
      en: 'chapter-02',
    });

    expect(reportUriMap.wdr25.chapters.uri.en['chapter-02']).toBe('chapter-02');
  });
});

describe('report release helpers', () => {
  it('returns false for unknown locale or report', () => {
    expect(isReportReleased('xx', 'wdr25', 'preview')).toBe(false);
    expect(isReportReleased('en', 'unknown-report', 'preview')).toBe(false);
  });

  it('respects locale release gating', () => {
    expect(isReportReleased('es', 'wdr25', 'preview')).toBe(false);
    expect(isReportReleased('en', 'wdr25', 'preview')).toBe(true);
  });

  it('filters visible reports by locale release', () => {
    expect(getVisibleReports('es', 'preview')).toEqual({});
    expect(getVisibleReports('en', 'preview')).toHaveProperty('wdr25');
  });
});

describe('reportUriMap error branches', () => {
  const createChapter = (chapterKey, chapterNumber) => ({
    metadata: { chapterKey, chapterNumber },
  });

  const buildMockLocaleModule = (chapters) => ({
    reports: {
      wdr25: {
        chapters,
      },
    },
  });

  const mockLocaleModules = (localeModules) => {
    jest.resetModules();
    jest.doMock('../../src/reports/ar', () => localeModules.ar);
    jest.doMock('../../src/reports/en', () => localeModules.en);
    jest.doMock('../../src/reports/fr', () => localeModules.fr);
    jest.doMock('../../src/reports/ru', () => localeModules.ru);
    jest.doMock('../../src/reports/zh', () => localeModules.zh);
    jest.doMock('../../src/reports/es', () => localeModules.es);
  };

  afterEach(() => {
    jest.dontMock('../../src/reports/ar');
    jest.dontMock('../../src/reports/en');
    jest.dontMock('../../src/reports/fr');
    jest.dontMock('../../src/reports/ru');
    jest.dontMock('../../src/reports/zh');
    jest.dontMock('../../src/reports/es');
  });

  it('throws on duplicate canonical chapter metadata', () => {
    const enModule = buildMockLocaleModule({
      'chapter-01': createChapter('chapter-01', 1),
      'chapter-02': createChapter('chapter-02', 1),
      'chapter-01-dup': createChapter('chapter-01', 2),
    });

    const localeModules = {
      ar: enModule,
      en: enModule,
      fr: enModule,
      ru: enModule,
      zh: enModule,
      es: enModule,
    };

    expect(() => {
      jest.isolateModules(() => {
        mockLocaleModules(localeModules);
        require('../../src/reports');
      });
    }).toThrow('Duplicate canonical chapter number "1" in report "wdr25".');
  });

  it('throws on duplicate locale chapter mappings', () => {
    const enModule = buildMockLocaleModule({
      'chapter-01': createChapter('chapter-01', 1),
    });

    const frModule = buildMockLocaleModule({
      'chapitre-01': createChapter('chapter-01', 1),
      'chapitre-01-dup': createChapter('chapter-01', 1),
    });

    const localeModules = {
      ar: enModule,
      en: enModule,
      fr: frModule,
      ru: enModule,
      zh: enModule,
      es: enModule,
    };

    expect(() => {
      jest.isolateModules(() => {
        mockLocaleModules(localeModules);
        require('../../src/reports');
      });
    }).toThrow(
      'Duplicate chapter slug mapping for locale "fr" in report "wdr25".'
    );
  });

  it('skips chapters without canonical mapping', () => {
    const enModule = buildMockLocaleModule({
      'chapter-01': createChapter('chapter-01', 1),
    });

    const esModule = buildMockLocaleModule({
      'capitulo-99': createChapter('chapter-99', 99),
    });

    const localeModules = {
      ar: enModule,
      en: enModule,
      fr: enModule,
      ru: enModule,
      zh: enModule,
      es: esModule,
    };

    let mockedReportUriMap;
    jest.isolateModules(() => {
      mockLocaleModules(localeModules);
      ({ reportUriMap: mockedReportUriMap } = require('../../src/reports'));
    });

    expect(mockedReportUriMap.wdr25.chapters.uri.es).toEqual({});
  });
});
