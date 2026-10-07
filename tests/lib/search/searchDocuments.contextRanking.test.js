import { searchDocuments } from '@/lib/search/flexsearch.js';
import { createDocument, createSearchIndex } from '@/lib/search/db.js';

jest.mock('@/lib/search/db.js', () => {
  const actual = jest.requireActual('@/lib/search/db.js');

  return {
    __esModule: true,
    ...actual,
    createSearchIndex: jest.fn(),
  };
});

describe('searchDocuments() context ranking', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ranks title phrase matches above excerpt context matches above scattered matches', async () => {
    const dummyIndex = createDocument('en');
    const filler = Array.from({ length: 150 }, (_, i) => `word${i}`).join(' ');

    // query words appear early (default FlexSearch relevance favors this) but far apart -
    // beyond the excerpt's context depth of 2, so this should rank last.
    await dummyIndex.addAsync({
      id: 'far',
      chapterPrefix: 'Chapter 09',
      title: 'Unrelated topic',
      excerpt: `Harmful is the very first word here, and only much later do we get to information. ${filler}`,
      href: '/en/reports/wdr26/far'
    });

    // query words appear late (default FlexSearch relevance disfavors this) but close
    // together - within the excerpt's context depth of 2.
    await dummyIndex.addAsync({
      id: 'near',
      chapterPrefix: 'Chapter 09',
      title: 'Another unrelated topic',
      excerpt: `${filler} Right at the very end, harmful direct information appears close together.`,
      href: '/en/reports/wdr26/near'
    });

    // exact phrase in the title should outrank both excerpt-only matches.
    await dummyIndex.addAsync({
      id: 'title',
      chapterPrefix: 'Chapter 09',
      title: 'Harmful information as a title phrase',
      excerpt: `${filler}`,
      href: '/en/reports/wdr26/title'
    });

    createSearchIndex.mockResolvedValue(dummyIndex);

    const { results } = await searchDocuments({ locale: 'en', query: 'harmful information', limit: 5 });
    const ids = results.map((result) => result.id);

    expect(ids).toEqual(expect.arrayContaining(['title', 'near', 'far']));
    expect(ids.indexOf('title')).toBeLessThan(ids.indexOf('near'));
    expect(ids.indexOf('near')).toBeLessThan(ids.indexOf('far'));
  });
});
