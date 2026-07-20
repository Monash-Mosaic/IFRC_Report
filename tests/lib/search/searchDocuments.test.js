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

describe('searchDocuments() Test', () => {
  let dummyIndex;

  beforeEach(async () => {
    dummyIndex = createDocument('en');

    await dummyIndex.addAsync({
      id: "1",
      chapterPrefix: "Synthesis",
      title: "Harmful information is not background noise",
      excerpt: "Harmful information is not background noise; it actively shapes how people understand crises, who they trust and whether they can access humanitarian assistance and protection. It influences safety and security both directly and indirectly. The struggle over harmful information is as much about cables as it is about content – the infrastructures and narratives that shape access, trust and power.\nAs the information ecosystem becomes increasingly complex, so too must the capacity to read it, respond to it and protect affected populations, individuals and organizations from its harms. Navigating this ecosystem is now a core part of what it means to act in humanitarian crises. It must inform how responses are designed and implemented, while also driving advocacy for broader systemic change. \nHere are some acronyms: AI, CAR, CBS, CDAC, CRED, CSO, DRC, DREF, DRM, ICRC, ICT, IDMC, IFRC, ITU, MDH, MHPSS, NGO, OCHA, OECD, Q&A, RCCE, SDG, UNDP, UNHCR, WHO.",
      href: "/en/reports/wdr26/synthesis#harmful-information-is-not-background-noise"
    });

    await dummyIndex.addAsync({
      id: "2",
      chapterPrefix: "Introduction",
      title: "Introduction",
      excerpt: "The World Disasters Report is the flagship publication of the International Federation of Red Cross and Red Crescent Societies (IFRC), designed to drive policy change, shape thinking and strengthen practice across the humanitarian sector. This 2026 edition focuses on harmful information in humanitarian contexts.\nThe IFRC defines harmful information as “information that has the potential to cause, contribute to, or result in harm to an individual or entity”. The term focuses attention on the harm itself, rather than on classifying the type of information being spread, which is often difficult to discern and constantly evolving. Harmful information includes misinformation, disinformation, malinformation, hate speech and other damaging narratives (see Annex I: Glossary, on page 353 ).\nToday, as the humanitarian sector confronts a new wave of technological change – artificial intelligence (AI) – the stakes are rising once again. AI is accelerating the production and spread of information at unprecedented speed and scale, lowering the barriers to entry for malicious actors to manipulate content and influence opinion. Governance frameworks are struggling to keep pace.",
      href: "/en/reports/wdr26/introduction"
    });

    await dummyIndex.addAsync({
      id: "3",
      chapterPrefix: "Chapter 01",
      title: "Introduction",
      excerpt: "For the humanitarian sector, the 2004 Indian Ocean tsunami marked the first major disaster to receive widespread digital coverage, while the wars in Afghanistan and Iraq (in the early 2000s) became the first armed conflicts dissected in real time by thousands of online commentators. This signalled the start of a decentralized digital information era, shaped less by traditional media and more by fast, participatory online spaces. Early digital content often failed to reflect local realities, particularly in contexts where local languages were absent from platforms. Yet the emerging blogger community played an active role in reporting, verifying content and calling out manipulated imagery,[^1] fabricated reporting[^2] or exaggerated harm. While imperfect,[^3] these efforts exposed new possibilities for scrutiny and public accountability.",
      href: "/en/reports/wdr26/chapter-01#introduction"
    });

    await dummyIndex.addAsync({
      id: "4",
      chapterPrefix: "Chapter 01",
      title: "What is the impact of harmful information?",
      excerpt: "Laws, policies and plans underpin all aspects of disaster risk management (DRM), protecting and preparing communities all around the world. Robust legal and policy frameworks are therefore a crucial piece of the puzzle for promoting information integrity and addressing the challenges posed by harmful information in DRM. To respond effectively, humanitarian actors must understand how harmful information disrupts response efforts. A typology of harm is important in building an evidence base that supports efforts to identify, measure and mitigate these effects. Each of the following types of harm can significantly undermine humanitarian action and all must be better understood, monitored and addressed.",
      href: "/en/reports/wdr26/chapter-01#-what-is-the-impact-of-harmful-information"
    });

    await dummyIndex.addAsync({
      id: "5",
      chapterPrefix: "Chapter 08",
      title: "What’s ahead? Evolutions and known unknowns",
      excerpt: "AI holds potential for humanitarian action, but there is a growing risk that cost-driven, unregulated use could harm vulnerable communities. Building a Responsible Humanitarian Approach: The ICRC’s Policy on Artificial Intelligence [^10] provides an overarching framework to guide the organization’s exploration and use of AI in ways that align with its humanitarian mission and principles. The SAFE AI project,[^11] led by CDAC Network, The Alan Turing Institute and Humanitarian AI Advisory, with support from the UK Foreign, Commonwealth and Development Office, aims to create practical standards, tools and community-driven frameworks to ensure AI is used responsibly and ethically in humanitarian settings. Monitoring the impact of AI on crisis-affected populations will be essential to ensure that its use remains safe, effective and principled.\n",
      href: "/en/reports/wdr26/chapter-08#whats-ahead-evolutions-and-known-unknowns"
    });

    createSearchIndex.mockResolvedValue(dummyIndex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty results for blank or invalid input', async () => {
    await expect(searchDocuments({ locale: 'en', query: '   ' })).resolves.toEqual([]);
    await expect(searchDocuments({ locale: 'en', query: 'test', limit: 0 })).resolves.toEqual([]);
    await expect(searchDocuments({ locale: 'xx', query: 'test' })).resolves.toEqual([]);
  });

  it('returns empty results for non-matching search terms', async () => {
    const results = await searchDocuments({ locale: 'en', query: 'nonexistent', limit: 5 });
    expect(results).toEqual([]);
  });

  it('returns single relevant document for single unique keyword search', async () => {
    const results = await searchDocuments({ locale: 'en', query: 'flagship', limit: 5 });

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '2',
          title: "Introduction > Introduction"
        }),
      ])
    );

    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));
  });

  it('search ignores leading and trailing spaces', async () => {
    const results = await searchDocuments({ locale: 'en', query: '   flagship  ', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));
  });

  it('search is case insensitive', async () => {
    const results = await searchDocuments({ locale: 'en', query: 'fLAgshiP', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));
  });

  it('search ignores punctuation and special characters', async () => {
    let results = await searchDocuments({ locale: 'en', query: '[flagship]', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));

    results = await searchDocuments({ locale: 'en', query: '"flagship"?!', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));
  });

  it('search ignores stop words', async () => {
    let results = await searchDocuments({ locale: 'en', query: 'the flagship', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));

    results = await searchDocuments({ locale: 'en', query: 'trust and power', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>trust</em> and <em>power</em>'));
  });

  it('search ignores footnotes', async () => {
    let results = await searchDocuments({ locale: 'en', query: '10', limit: 5 });
    expect(results).toHaveLength(0);

    results = await searchDocuments({ locale: 'en', query: '[^11]', limit: 5 });
    expect(results).toHaveLength(0);
  });

  it('returns multiple relevant documents for single keyword search', async () => {
    let results = await searchDocuments({ locale: 'en', query: 'content', limit: 5 });
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '3']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>content</em>'));
    });

    results = await searchDocuments({ locale: 'en', query: 'drive', limit: 5 });
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.id).sort()).toEqual(['2', '5']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>drive</em>'));
    });
  });

  it('returns relevant documents for search with numerical characters', async () => {
    let results = await searchDocuments({ locale: 'en', query: '2026', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    results = await searchDocuments({ locale: 'en', query: '353', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    results = await searchDocuments({ locale: 'en', query: '92026', limit: 5 });
    expect(results).toHaveLength(0);

    results = await searchDocuments({ locale: 'en', query: '2026 edition', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    // TODO: Fix this test, currently failing
    // results = await searchDocuments({ locale: 'en', query: '2000s', limit: 5 });
    // expect(results).toHaveLength(1);
    // expect(results[0].id).toEqual('3');
  });

  it('similar words to keyword are treated different (e.g. "organization" vs. "organize")', async () => {
    let results = await searchDocuments({ locale: 'en', query: 'organization', limit: 5 });
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '5']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>organization</em>'));
    });

    results = await searchDocuments({ locale: 'en', query: 'organize', limit: 5 });
    expect(results).toHaveLength(0);
  });

  it('returns relevant documents for multi-word search', async () => {
    let results = await searchDocuments({ locale: 'en', query: 'background noise', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>background noise</em>'));

    results = await searchDocuments({ locale: 'en', query: 'affected populations', limit: 5 });
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '5']);

    results = await searchDocuments({ locale: 'en', query: 'policy change', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2'); 
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>policy change</em>'));
  });

  it('returns relevant documents for search with acronyms', async () => {
    // AI (Artificial Intelligence)
    let results = await searchDocuments({ locale: 'en', query: 'artificial intelligence', limit: 5 });
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '5']); // 1 doesn't have "Artificial Intelligence" in the excerpt but has "AI" which is an acronym for it

    // DRC (Democratic Republic of the Congo)
    results = await searchDocuments({ locale: 'en', query: 'democratic republic of the congo', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
  });

  // it('test', async () => {
  //   const results = await searchDocuments({ locale: 'en', query: "cost-driven", limit: 5 });
  //   console.log('Results:', results);
  // });
});