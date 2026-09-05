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

describe('searchDocuments() acronym highlighting', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('highlights a bare acronym in the excerpt instead of leaving an empty <em></em>', async () => {
    const dummyIndex = createDocument('en');

    await dummyIndex.addAsync({
      id: 'doc1',
      chapterPrefix: 'Chapter 1',
      title: 'Technology in humanitarian response',
      excerpt: 'The use of AI in humanitarian settings is growing rapidly across many sectors.',
      href: '/en/test'
    });

    createSearchIndex.mockResolvedValue(dummyIndex);

    const { results } = await searchDocuments({ locale: 'en', query: 'AI', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>AI</em>'));
    expect(results[0].highlight).not.toEqual(expect.stringContaining('<em></em>'));
  });
});
