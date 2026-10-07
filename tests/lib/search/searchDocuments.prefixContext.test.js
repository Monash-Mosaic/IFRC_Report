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

describe('searchDocuments() prefix-aware context matching', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the context boost when the query uses a singular form of an indexed plural word', async () => {
    const dummyIndex = createDocument('en');
    const filler = Array.from({ length: 150 }, (_, i) => `word${i}`).join(' ');

    // "challenges" (plural) sits right next to "urgent" - a context match under both the
    // plural and singular query, since tokenize:"forward" matches "challenge" as a prefix
    // of "challenges". Both words are placed deep in the text, so plain FlexSearch
    // relevance (which favors earlier positions) would rank this doc *behind* "decoy"
    // without the context boost correctly kicking in.
    await dummyIndex.addAsync({
      id: 'match',
      chapterPrefix: 'Chapter 01',
      title: 'Information integrity in crisis situations',
      excerpt: `${filler} This section discusses several urgent challenges facing the sector today.`,
      href: '/en/reports/wdr26/match'
    });

    // both words present early (so plain FlexSearch relevance favors this doc) but more
    // than 3 words apart, so it should never earn the excerpt context boost.
    await dummyIndex.addAsync({
      id: 'decoy',
      chapterPrefix: 'Chapter 02',
      title: 'Unrelated chapter',
      excerpt: `Urgent issues arise immediately here, well before this padding and this padding finally lead to challenges being mentioned. ${filler}`,
      href: '/en/reports/wdr26/decoy'
    });

    createSearchIndex.mockResolvedValue(dummyIndex);

    const { results: plural } = await searchDocuments({ locale: 'en', query: 'urgent challenges', limit: 5 });
    expect(plural.map((r) => r.id)).toEqual(expect.arrayContaining(['match', 'decoy']));
    expect(plural[0].id).toEqual('match');

    const { results: singular } = await searchDocuments({ locale: 'en', query: 'urgent challenge', limit: 5 });
    expect(singular.map((r) => r.id)).toEqual(expect.arrayContaining(['match', 'decoy']));
    expect(singular[0].id).toEqual('match');
  });
});
