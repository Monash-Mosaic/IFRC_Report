jest.mock('@/lib/search/db.js', () => ({
  createSearchIndex: jest.fn(),
}));

jest.mock('@/lib/search/flexsearch-highlight.js', () => ({
  highlight_fields: jest.fn((query, results) =>
    results.map((result) => ({
      ...result,
      highlight: `<em>${query}</em>`,
    }))
  ),
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(async () => (key) => key),
}));

import { createSearchIndex } from '@/lib/search/db.js';
import { highlight_fields } from '@/lib/search/flexsearch-highlight.js';
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
    await expect(searchDocuments({ locale: 'en', query: '   ' })).resolves.toEqual([]);
    await expect(searchDocuments({ locale: 'en', query: 'test', limit: 0 })).resolves.toEqual([]);
    await expect(searchDocuments({ locale: 'xx', query: 'test' })).resolves.toEqual([]);
  });

  it('searches and maps document results for supported locales', async () => {
    mockSearch.mockResolvedValue([
      {
        doc: {
          id: 'doc-1',
          title: 'Climate',
          chapterPrefix: 'Chapter 1',
          href: '/reports/ch1',
        },
      },
    ]);

    const results = await searchDocuments({ locale: 'en', query: 'climate', limit: 5 });

    expect(createSearchIndex).toHaveBeenCalledWith('en', { engine: 'd1' });
    expect(highlight_fields).toHaveBeenCalled();
    expect(results).toEqual([
      {
        id: 'doc-1',
        title: 'Chapter 1 > Climate',
        highlight: '<em>climate</em>',
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

describe('flexsearch-highlight re-export', () => {
  it('exports highlight_fields from flexsearch internals', async () => {
    const mod = await import('@/lib/search/flexsearch-highlight.js');
    expect(typeof mod.highlight_fields).toBe('function');
  });
});
