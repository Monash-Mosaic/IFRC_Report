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

describe('searchDocuments() acronym synonyms', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('finds documents that only spell the expansion out when searching the acronym', async () => {
    const dummyIndex = createDocument('en');

    await dummyIndex.addAsync({
      id: 'withAcronym',
      chapterPrefix: 'Chapter 02',
      title: 'Trust metrics',
      excerpt: 'Community Engagement and Accountability (CEA) is a vital bridge to building trust.',
      href: '/en/reports/wdr26/with-acronym',
    });

    // spells the term out with no acronym anywhere - this is the case that used to be
    // unreachable from a "CEA" query, because search is AND-based and the query expanded to
    // a `cea` term this document never had.
    await dummyIndex.addAsync({
      id: 'expansionOnly',
      chapterPrefix: 'Chapter 06',
      title: 'Regional work',
      excerpt: 'In Central America, the institutionalization of community engagement and accountability continues.',
      href: '/en/reports/wdr26/expansion-only',
    });

    createSearchIndex.mockResolvedValue(dummyIndex);

    for (const query of ['CEA', 'community engagement and accountability']) {
      const { results } = await searchDocuments({ locale: 'en', query, limit: 10 });
      expect(results.map((r) => r.id).sort()).toEqual(['expansionOnly', 'withAcronym']);
    }
  });

  it('matches a French acronym written with an elided article', async () => {
    const dummyIndex = createDocument('fr');

    // "l’IA" - the apostrophe is elision, so the acronym is its own word. Joining it into
    // "lia" made this document unfindable by either "IA" or "intelligence artificielle".
    await dummyIndex.addAsync({
      id: 'elided',
      chapterPrefix: 'Chapitre 08',
      title: 'Perspectives',
      excerpt: 'L’IA recèle un potentiel pour l’action humanitaire, mais le risque croissant est reel.',
      href: '/fr/reports/wdr26/elided',
    });

    createSearchIndex.mockResolvedValue(dummyIndex);

    for (const query of ['IA', 'intelligence artificielle']) {
      const { results } = await searchDocuments({ locale: 'fr', query, limit: 10 });
      expect(results.map((r) => r.id)).toEqual(['elided']);
    }
  });
});
