import path from 'node:path';

describe('XML chapter loader', () => {
  it('returns the MDX-compatible metadata and a closed-over Chapter component', async () => {
    const { loadXmlChapter } = await import('@/lib/xml-chapter/index.js');
    const result = await loadXmlChapter({
      filePath: path.resolve('tests/fixtures/xml-chapter/minimal.xml'),
      locale: 'en',
      reportSlug: 'wdr25',
      chapterNumber: 1,
      assetBasePath: '/wdr25/chapter-01',
    });

    expect(result.title).toBe('Title');
    expect(result.subtitle).toBe('Subtitle');
    expect(result.tableOfContents).toHaveLength(1);
    expect(typeof result.default).toBe('function');
  });

});
