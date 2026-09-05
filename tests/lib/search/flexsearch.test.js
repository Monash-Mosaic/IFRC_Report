jest.mock('@/lib/search/db.js', () => ({
  createSearchIndex: jest.fn(),
  // searchDocuments encodes the query (and each result's text) to tell a complete match
  // from a partial one. This stub only has to be consistent with itself: lowercased word
  // splitting is enough for the ordering assertions here, and keeps the unit test free of
  // the real encoder's acronym/stopword behaviour, which is covered by the integration
  // tests in searchDocuments.test.js.
  createFieldEncoder: jest.fn(() => ({
    encode: (str) => (str || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean),
  })),
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(async () => (key) => key),
}));

import { createSearchIndex } from '@/lib/search/db.js';
import { searchDocuments } from '@/lib/search/flexsearch.js';

describe('searchDocuments', () => {
  const mockSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    createSearchIndex.mockResolvedValue({
      index: {},
      searchCacheAsync: mockSearch,
    });
  });

  it('returns empty results for blank or invalid input', async () => {
    await expect(searchDocuments({ locale: 'en', query: '   ' })).resolves.toEqual({ total: 0, results: [] });
    await expect(searchDocuments({ locale: 'en', query: 'test', limit: 0 })).resolves.toEqual({ total: 0, results: [] });
    await expect(searchDocuments({ locale: 'xx', query: 'test' })).resolves.toEqual({ total: 0, results: [] });
  });

  it('searches and maps document results for supported locales', async () => {
    mockSearch.mockResolvedValue([
      {
        doc: {
          id: 'doc-1',
          title: 'Climate',
          excerpt: 'Climate change is a major issue.',
          chapterPrefix: 'Chapter 1',
          href: '/reports/ch1',
        },
      },
    ]);

    const { total, results } = await searchDocuments({ locale: 'en', query: 'climate', limit: 5 });

    expect(createSearchIndex).toHaveBeenCalledWith('en', { engine: 'd1' });
    expect(total).toEqual(1);
    expect(results).toEqual([
      {
        id: 'doc-1',
        title: 'Chapter 1 > Climate',
        titleHighlight: 'Chapter 1 > <em>Climate</em>',
        highlight: '<em>Climate</em> change is a major issue.',
        href: '/reports/ch1',
      },
    ]);
  });

  it('reuses cached index for repeated locale queries', async () => {
    mockSearch.mockResolvedValue([]);
    await searchDocuments({ locale: 'fr', query: 'aide' });
    await searchDocuments({ locale: 'fr', query: 'aide' });
    expect(createSearchIndex).toHaveBeenCalledTimes(1);
  });
});
