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

// `WHO` and `CAR` are acronyms that are also ordinary English words. They cannot be
// expanded during encoding, because the encoder lowercases before `prepare` runs - doing
// it there rewrote every relative-pronoun "who" into "world health organization", which
// is why they are absent from EN_ACRONYMS in db.js. The expansion happens on the query
// string instead, where the user's capitalization still exists.
//
// This lives in its own file because searchDocuments caches one index per locale for the
// lifetime of the module, so a second `en` fixture set in the same file would never be
// used.
describe('searchDocuments() cased-acronym queries', () => {
  beforeEach(async () => {
    const dummyIndex = createDocument('en');

    await dummyIndex.addAsync({
      id: 'health',
      chapterPrefix: 'Chapter 03',
      title: 'Health guidance in emergencies',
      excerpt:
        'The World Health Organization published guidance on responding to infodemics during health emergencies.',
      href: '/en/reports/wdr26/chapter-03#health-guidance',
    });

    await dummyIndex.addAsync({
      id: 'pronoun',
      chapterPrefix: 'Chapter 04',
      title: 'Displacement and trust',
      excerpt:
        'People who fled their homes rely on neighbours and volunteers for information they can act on.',
      href: '/en/reports/wdr26/chapter-04#displacement',
    });

    createSearchIndex.mockResolvedValue(dummyIndex);
  });

  it('finds the organization when the acronym is typed', async () => {
    const { results } = await searchDocuments({ locale: 'en', query: 'WHO', limit: 5 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toEqual('health');
    // The three expansion words are adjacent, so the highlighter collapses them into one
    // mark rather than three.
    expect(results[0].highlight).toEqual(
      expect.stringContaining('<em>World Health Organization</em>')
    );
  });

  it('treats a bare lowercase query as the acronym too', async () => {
    // Nobody searches for the relative pronoun on its own, so a one-word "who" is the
    // organization regardless of how it was typed.
    const { results } = await searchDocuments({ locale: 'en', query: 'who', limit: 5 });

    expect(results[0].id).toEqual('health');
  });

  it('does not expand the pronoun inside a sentence', async () => {
    // The regression that forced expansion off in the first place: "who" here is a
    // relative pronoun, so the query must not become a search for the organization.
    const { results } = await searchDocuments({ locale: 'en', query: 'people who fled', limit: 5 });

    expect(results[0].id).toEqual('pronoun');
  });
});
