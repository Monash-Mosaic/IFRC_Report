import { reportUriMap, isReportReleased, getVisibleReports } from '@/reports';

const reportKeys = Object.keys(reportUriMap).filter((key) => key !== 'uri');
const activeReportKey = reportKeys[0];

describe('reportUriMap', () => {
  it('builds report-level mappings for all locales', () => {
    const expectedLocales = ['ar', 'en', 'es', 'fr', 'ru', 'zh'];

    expectedLocales.forEach((locale) => {
      expect(reportUriMap.uri[locale]).toBeDefined();
      expect(reportUriMap.uri[locale][activeReportKey]).toBe(activeReportKey);
    });

    expect(reportUriMap[activeReportKey].languages).toMatchObject(
      Object.fromEntries(expectedLocales.map((locale) => [locale, activeReportKey]))
    );
  });

  it('builds chapter-level mappings with reverse lookups', () => {
    const chapter = reportUriMap[activeReportKey].chapters['chapter-02'];

    expect(chapter.number).toBe(2);
    expect(chapter.languages).toMatchObject({
      ar: 'الفصل-02',
      en: 'chapter-02',
      es: 'capitulo-02',
      fr: 'chapitre-02',
      ru: 'глава-02',
      zh: '章节-02',
    });

    expect(reportUriMap[activeReportKey].chapters.uri.en['chapter-02']).toBe('chapter-02');
    expect(reportUriMap[activeReportKey].chapters.uri.es['capitulo-02']).toBe('chapter-02');
    expect(reportUriMap[activeReportKey].chapters.uri.fr['chapitre-02']).toBe('chapter-02');
    expect(reportUriMap[activeReportKey].chapters.uri.ru['глава-02']).toBe('chapter-02');
    expect(reportUriMap[activeReportKey].chapters.uri.zh['章节-02']).toBe('chapter-02');
    expect(reportUriMap[activeReportKey].chapters.uri.ar['الفصل-02']).toBe('chapter-02');
  });
});

describe('report release helpers', () => {
  it('returns false for unknown locale or report', () => {
    expect(isReportReleased('xx', activeReportKey, 'preview')).toBe(false);
    expect(isReportReleased('en', 'unknown-report', 'preview')).toBe(false);
  });

  it('respects locale release gating', () => {
    expect(isReportReleased('es', activeReportKey, 'preview')).toBe(true);
    expect(isReportReleased('en', activeReportKey, 'preview')).toBe(true);
  });

  it('filters visible reports by locale release', () => {
    expect(getVisibleReports('es', 'preview')).toHaveProperty(activeReportKey);
    expect(getVisibleReports('en', 'preview')).toHaveProperty(activeReportKey);
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
    }).toThrow('Duplicate chapter slug mapping for locale "fr" in report "wdr25".');
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
