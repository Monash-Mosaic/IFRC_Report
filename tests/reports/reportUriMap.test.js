import { reportUriMap } from '@/reports';

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
    expect(chapter.languages).toMatchObject({
      ar: 'الفصل-02',
      en: 'chapter-02',
      es: 'capitulo-02',
      fr: 'chapitre-02',
      ru: 'глава-02',
      zh: '章节-02',
    });

    expect(reportUriMap.wdr25.chapters.uri.en['chapter-02']).toBe('chapter-02');
    expect(reportUriMap.wdr25.chapters.uri.es['capitulo-02']).toBe('chapter-02');
    expect(reportUriMap.wdr25.chapters.uri.fr['chapitre-02']).toBe('chapter-02');
    expect(reportUriMap.wdr25.chapters.uri.ru['глава-02']).toBe('chapter-02');
    expect(reportUriMap.wdr25.chapters.uri.zh['章节-02']).toBe('chapter-02');
    expect(reportUriMap.wdr25.chapters.uri.ar['الفصل-02']).toBe('chapter-02');
  });
});
