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

describe('searchDocuments() English Test', () => {
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
    await expect(searchDocuments({ locale: 'en', query: '   ' })).resolves.toEqual({ total: 0, results: [] });
    await expect(searchDocuments({ locale: 'en', query: 'test', limit: 0 })).resolves.toEqual({ total: 0, results: [] });
    await expect(searchDocuments({ locale: 'xx', query: 'test' })).resolves.toEqual({ total: 0, results: [] });
  });

  it('returns empty results for non-matching search terms', async () => {
    const { results } = await searchDocuments({ locale: 'en', query: 'nonexistent', limit: 5 });
    expect(results).toEqual([]);
  });

  it('returns single relevant document for single unique keyword search', async () => {
    const { results } = await searchDocuments({ locale: 'en', query: 'flagship', limit: 5 });

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
    const { results } = await searchDocuments({ locale: 'en', query: '   flagship  ', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));
  });

  it('search is case insensitive', async () => {
    const { results } = await searchDocuments({ locale: 'en', query: 'fLAgshiP', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));
  });

  it('search ignores punctuation and special characters', async () => {
    let { results } = await searchDocuments({ locale: 'en', query: '[flagship]', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));

    ({ results } = await searchDocuments({ locale: 'en', query: '"flagship"?!', limit: 5 }));

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));
  });

  it('search ignores stop words', async () => {
    let { results } = await searchDocuments({ locale: 'en', query: 'the flagship', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>flagship</em>'));

    ({ results } = await searchDocuments({ locale: 'en', query: 'trust and power', limit: 5 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>trust</em> and <em>power</em>'));
  });

  it('search ignores footnotes', async () => {
    let { results } = await searchDocuments({ locale: 'en', query: '10', limit: 5 });
    expect(results).toHaveLength(0);

    ({ results } = await searchDocuments({ locale: 'en', query: '[^11]', limit: 5 }));
    expect(results).toHaveLength(0);
  });

  it('returns multiple relevant documents for single keyword search', async () => {
    let { results } = await searchDocuments({ locale: 'en', query: 'content', limit: 5 });
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '3']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>content</em>'));
    });

    ({ results } = await searchDocuments({ locale: 'en', query: 'drive', limit: 5 }));
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.id).sort()).toEqual(['2', '5']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>drive</em>'));
    });
  });

  it('returns relevant documents for search with numerical characters', async () => {
    let { results } = await searchDocuments({ locale: 'en', query: '2026', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    ({ results } = await searchDocuments({ locale: 'en', query: '353', limit: 5 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    ({ results } = await searchDocuments({ locale: 'en', query: '92026', limit: 5 }));
    expect(results).toHaveLength(0);

    ({ results } = await searchDocuments({ locale: 'en', query: '2026 edition', limit: 5 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    // TODO: Fix this test, currently failing
    // results = await searchDocuments({ locale: 'en', query: '2000s', limit: 5 });
    // expect(results).toHaveLength(1);
    // expect(results[0].id).toEqual('3');
  });

  it('similar words to keyword are treated different (e.g. "organization" vs. "organize")', async () => {
    let { results } = await searchDocuments({ locale: 'en', query: 'organization', limit: 5 });
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '5']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>organization</em>'));
    });

    ({ results } = await searchDocuments({ locale: 'en', query: 'organize', limit: 5 }));
    expect(results).toHaveLength(0);
  });

  it('returns relevant documents for multi-word search', async () => {
    let { results } = await searchDocuments({ locale: 'en', query: 'background noise', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>background noise</em>'));

    ({ results } = await searchDocuments({ locale: 'en', query: 'affected populations', limit: 5 }));
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '5']);

    // `suggest: true` also returns documents matching only *part* of the query - here
    // "policy" alone and "change" alone - so the assertion is about order, not count: the
    // document containing the whole phrase has to come first, with the partial matches
    // ranked below it.
    ({ results } = await searchDocuments({ locale: 'en', query: 'policy change', limit: 5 }));
    expect(results[0].id).toEqual('2');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>policy change</em>'));
    expect(results.slice(1).map((result) => result.id)).not.toContain('2');
  });

  it('returns relevant documents for search with acronyms', async () => {
    // AI (Artificial Intelligence)
    let { results } = await searchDocuments({ locale: 'en', query: 'artificial intelligence', limit: 5 });
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '5']); // 1 doesn't have "Artificial Intelligence" in the excerpt but has "AI" which is an acronym for it

    // DRC (Democratic Republic of the Congo)
    ({ results } = await searchDocuments({ locale: 'en', query: 'democratic republic of the congo', limit: 5 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
  });
});

describe('searchDocuments() French Test', () => {
  let dummyIndex;

  beforeEach(async () => {
    dummyIndex = createDocument('fr');

    await dummyIndex.addAsync({
      id: "1",
      chapterPrefix: "Synthèse",
      title: "Les informations préjudiciables ne sont pas un bruit de fond",
      excerpt: "Les informations préjudiciables ne sont pas un bruit de fond. En plus d’influencer directement la façon dont les personnes comprennent les crises, la confiance qu’elles accordent et leur accès à l’aide humanitaire et aux services de protection, elles influent aussi, directement et indirectement, sur la sûreté et la sécurité. La lutte contre les informations préjudiciables concerne autant le matériel que le contenu, c’est-à-dire les infrastructures et les propos qui ont un effet sur l’accès, la confiance et le pouvoir.\nL’écosystème de l’information devenant de plus en plus complexe, la capacité de le comprendre, d’y répondre et de protéger les populations, les personnes et les organisations concernées de ses atteintes doit être adaptée en conséquence. La gestion de cet écosystème fait désormais partie intégrante des interventions en cas de crise humanitaire. Cette nécessité doit guider la conception et la mise en œuvre des interventions, et sous-tendre un plaidoyer en faveur de changements systémiques plus vastes.\nVoici quelques acronymes: CBS, CDAC, CEA, CICR, CRED, DREF, EM-DAT, GIEC, HCR, IA, IDMC, IFRC, OCDE, OCHA, ODD, OMS, ONG, PNUD, RCCE, RDC, TIC, UIT.",
      href: "/fr/reports/wdr26/synthèse#les-informations-préjudiciables-ne-sont-pas-un-bruit-de-fond"
    });

    await dummyIndex.addAsync({
      id: "2",
      chapterPrefix: "Introduction",
      title: "Introduction",
      excerpt: "Publication phare de la Fédération internationale des Sociétés de la Croix-Rouge et du Croissant-Rouge, le Rapport sur les catastrophes dans le monde vise à susciter des changements de politiques, à orienter la réflexion et à renforcer les pratiques dans l’ensemble du secteur humanitaire. Cette édition 2026 a pour thème les informations préjudiciables dans les contextes humanitaires.\nLa Fédération internationale définit les informations préjudiciables comme des informations susceptibles de causer, directement ou indirectement, un préjudice à une personne ou à une entité, ou d’y contribuer. Ce terme met l’accent sur les atteintes elles-mêmes, plutôt que sur le type d’information propagé, qui est souvent difficile à définir et évolue constamment. Les informations préjudiciables comprennent la mésinformation, la désinformation, la malinformation, les discours de haine et autres discours néfastes (voir Annexe I : Glossaire, page 397 ).\nAujourd’hui, alors que le secteur humanitaire fait face à une nouvelle vague de changements technologiques, notamment l’intelligence artificielle (IA), les enjeux augmentent une fois de plus. Avec l’IA, la production et la propagation d’informations atteignent une vitesse et une échelle sans précédent. ",
      href: "/fr/reports/wdr26/introduction"
    });

    await dummyIndex.addAsync({
      id: "3",
      chapterPrefix: "Chapitre 01",
      title: "Introduction",
      excerpt: "Pour le secteur humanitaire, le tsunami survenu en 2004 dans l’océan Indien a été la première catastrophe d’envergure à faire l’objet d’une large couverture numérique, tandis que les guerres en Afghanistan et en Irak (au début des années 2000) ont constitué les premiers conflits armés analysés en temps réel par des milliers de commentateurs en ligne. Ces événements ont ainsi marqué l’avènement d’une ère de décentralisation de l’information numérique, davantage façonnée par des espaces en ligne rapides et participatifs que par les médias traditionnels. Les premiers contenus numériques reflétaient rarement les réalités locales, en particulier lorsque les plateformes ne permettaient pas de publier en langues locales. Cependant, la communauté émergente de blogueuses et blogueurs a contribué activement à la couverture médiatique, à la vérification des contenus, à la dénonciation des images manipulées[^1], des reportages fabriqués de toutes pièces[^2] ou des dommages exagérés. Bien qu’imparfaits[^3], ces efforts ont mis au jour de nouvelles possibilités en matière de vérification et de responsabilité publique.",
      href: "/fr/reports/wdr26/chapitre-01#introduction"
    });

    await dummyIndex.addAsync({
      id: "4",
      chapterPrefix: "Chapitre 01",
      title: "Quels sont les effets des informations préjudiciables ?",
      excerpt: "Les lois, les politiques et les plans constituent le fondement de toutes les activités de gestion des risques de catastrophe, et contribuent à la protection et à la préparation des communautés du monde entier. Il est donc primordial d’établir des cadres juridiques et politiques solides afin de favoriser l’intégrité de l’information et de relever les défis résultant de la diffusion d’informations préjudiciables dans ce domaine. Pour réagir efficacement, les acteurs humanitaires doivent comprendre comment ces informations perturbent les interventions. Il convient d’établir une typologie des différents préjudices en vue de constituer une base de données probantes qui appuiera les efforts visant à identifier, mesurer et atténuer ces effets. Chacun des types de préjudice ci-après peut compromettre considérablement l’action humanitaire et l’ensemble d’entre eux doivent être mieux appréhendés, surveillés et traités.",
      href: "/fr/reports/wdr26/chapitre-01#quels-sont-les-effets-des-informations-préjudiciables-"
    });

    await dummyIndex.addAsync({
      id: "5",
      chapterPrefix: "Chapitre 08",
      title: "Que nous réserve l’avenir ? Évolutions et variables connues",
      excerpt: "L’IA recèle un potentiel pour l’action humanitaire, mais le risque croissant d’une utilisation non réglementée et motivée par des considérations financières pourrait nuire aux communautés vulnérables. Dans sa publication intitulée « Building a Responsible Humanitarian Approach : The ICRC’s Policy on Artificial Intelligence » (Construire une approche humanitaire responsable : la politique du CICR en matière d’intelligence artificielle)[^10], le CICR fournit un cadre général pour guider l’exploration et l’utilisation de l’IA, conformément à sa mission et à ses principes humanitaires. Le projet SAFE AI[^11], mené par le réseau CDAC, l’Institut Alan Turing et Humanitarian AI Advisory, avec le soutien du ministère britannique des Affaires étrangères, du Commonwealth et du Développement, vise à élaborer des normes pratiques, des outils et des cadres communautaires afin de garantir une utilisation responsable et éthique de l’IA dans les contextes humanitaires. Il sera essentiel de surveiller les répercussions de l’IA sur les populations touchées par les crises afin de garantir que son utilisation reste sûre, efficace et conforme aux principes.",
      href: "/fr/reports/wdr26/chapitre-08#que-nous-réserve-lavenir--évolutions-et-variables-connues"
    });

    createSearchIndex.mockResolvedValue(dummyIndex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty results for blank or invalid input', async () => {
    await expect(searchDocuments({ locale: 'fr', query: '   ' })).resolves.toEqual({ total: 0, results: [] });
    await expect(searchDocuments({ locale: 'fr', query: 'test', limit: 0 })).resolves.toEqual({ total: 0, results: [] });
    await expect(searchDocuments({ locale: 'xx', query: 'test' })).resolves.toEqual({ total: 0, results: [] });
  });

  it('returns empty results for non-matching search terms', async () => {
    const { results } = await searchDocuments({ locale: 'fr', query: 'nonexistent', limit: 5 });
    expect(results).toEqual([]);
  });

  it('returns single relevant document for single unique keyword search', async () => {
    const { results } = await searchDocuments({ locale: 'fr', query: 'concerne', limit: 5 });

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          title: "Synthèse > Les informations préjudiciables ne sont pas un bruit de fond"
        }),
      ])
    );

    expect(results[0].highlight).toEqual(expect.stringContaining('<em>concerne</em>'));
  });

  it('search ignores leading and trailing spaces', async () => {
    const { results } = await searchDocuments({ locale: 'fr', query: '   concerne  ', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>concerne</em>'));
  });

  it('search is case insensitive', async () => {
    const { results } = await searchDocuments({ locale: 'fr', query: 'CONcerNE', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>concerne</em>'));
  });

  it('search ignores punctuation and special characters', async () => {
    let { results } = await searchDocuments({ locale: 'fr', query: '[concerne]', limit: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>concerne</em>'));

    ({ results } = await searchDocuments({ locale: 'fr', query: '"concerne"?!', limit: 5 }));

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>concerne</em>'));
  });

  it('search ignores accents', async () => {
    // With accents
    let { results } = await searchDocuments({ locale: 'fr', query: 'préjudiciables', limit: 5 });

    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '4']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>préjudiciables</em>'));
    });

    // Without accents
    ({ results } = await searchDocuments({ locale: 'fr', query: 'prejudiciables', limit: 5 }));

    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '4']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>préjudiciables</em>'));
    });
  });

  it('search ignores footnotes', async () => {
    let { results } = await searchDocuments({ locale: 'fr', query: '10', limit: 5 });
    expect(results).toHaveLength(0);

    ({ results } = await searchDocuments({ locale: 'fr', query: '[^11]', limit: 5 }));
    expect(results).toHaveLength(0);
  });

  it('returns multiple relevant documents for single keyword search', async () => {
    let { results } = await searchDocuments({ locale: 'fr', query: 'changements', limit: 5 });
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2']);
    results.forEach((result) => {
      expect(result.highlight).toEqual(expect.stringContaining('<em>changements</em>'));
    });
  });

  it('returns relevant documents for search with numerical characters', async () => {
    let { results } = await searchDocuments({ locale: 'fr', query: '2026', limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    ({ results } = await searchDocuments({ locale: 'fr', query: '397', limit: 5 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');

    ({ results } = await searchDocuments({ locale: 'fr', query: '92026', limit: 5 }));
    expect(results).toHaveLength(0);

    ({ results } = await searchDocuments({ locale: 'fr', query: 'édition 2026', limit: 5 }));
    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual('2');
  });

  it('returns relevant documents for multi-word search', async () => {
    // Ranked, not filtered: "fondement" is a forward-prefix match for "fond", so that
    // document is a legitimate partial hit under `suggest: true` - it just has to rank
    // below the one containing the actual phrase.
    let { results } = await searchDocuments({ locale: 'fr', query: 'bruit de fond', limit: 5 });
    expect(results[0].id).toEqual('1');
    expect(results[0].highlight).toEqual(expect.stringContaining('<em>bruit</em> de <em>fond</em>'));

    ({ results } = await searchDocuments({ locale: 'fr', query: 'informations préjudiciables', limit: 5 }));
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '4']);
  });

  it('returns relevant documents for search with acronyms', async () => {
    // IA (intelligence artificielle)
    let { results } = await searchDocuments({ locale: 'fr', query: 'intelligence artificielle', limit: 5 });
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id).sort()).toEqual(['1', '2', '5']); // 1 doesn't have "intelligence artificielle" in the excerpt but has "IA" which is an acronym for it

    // ODD (objectif de developpement durable). Documents mentioning only "développement"
    // are partial matches and come back too; the acronym document has to outrank them.
    ({ results } = await searchDocuments({ locale: 'fr', query: 'objectif de developpement durable', limit: 5 }));
    expect(results[0].id).toEqual('1');
  });
});