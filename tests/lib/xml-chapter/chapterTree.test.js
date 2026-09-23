import path from 'node:path';
import { parseXmlSource, parseXmlFile } from '@/lib/xml-chapter/parseXml';
import { convertToChapterTree, selectNarrativeStory } from '@/lib/xml-chapter/chapterTree';
import { XmlChapterError } from '@/lib/xml-chapter/errors';

describe('XML chapter normalization', () => {
  const chapterWith = (content) =>
    parseXmlSource(`<Story><Story><chapter-title>T</chapter-title>${content}</Story></Story>`);

  it('selects the nested narrative story and creates headings, paragraphs and TOC', () => {
    const tree = parseXmlSource(
      '<Story><fig href_fmt="cover.jpg"/><Story><chapter-title>  A title </chapter-title>' +
        '<h1> Introduction </h1><normal>Hello <bold>world</bold>.</normal></Story></Story>'
    );
    const result = convertToChapterTree(tree, { locale: 'en', chapterNumber: 1 });
    expect(selectNarrativeStory(tree).children.some((n) => n.name === 'chapter-title')).toBe(true);
    expect(result.title).toBe('A title');
    expect(result.children.map((n) => n.type)).toEqual(['heading', 'paragraph']);
    expect(result.children[1].children.map((n) => n.type)).toEqual(['text', 'strong', 'text']);
    expect(result.tableOfContents).toEqual([{ value: 'Introduction', id: 'introduction', depth: 1 }]);
  });

  it('coalesces consecutive bullet and numbered items', () => {
    const result = convertToChapterTree(parseXmlSource(
      '<Story><Story><chapter-title>T</chapter-title><bullet-list>one</bullet-list>' +
        '<bullet-list>two</bullet-list><numbered-list>three</numbered-list></Story></Story>'
    ));
    expect(result.children.map((n) => [n.type, n.ordered])).toEqual([
      ['list', false], ['list', true],
    ]);
    expect(result.children[0].children).toHaveLength(2);
  });

  it('rejects visible tags that are not part of the chapter vocabulary', () => {
    expect(() => convertToChapterTree(parseXmlSource(
      '<Story><Story><chapter-title>T</chapter-title><unknown>visible</unknown></Story></Story>'
    ))).toThrow(XmlChapterError);
  });

  it('preserves explicit boxes, contributors and asks/aims components', () => {
    const result = convertToChapterTree(parseXmlSource(
      '<Story><Story><chapter-title>T</chapter-title>' +
        '<Box index="1.1" types="Physical Social">' +
        '<ContributorTag><Contributor><ContributorName>Name</ContributorName>' +
        '<ContributorRole>Role</ContributorRole></Contributor></ContributorTag>' +
        '</Box><AsksAims><Asks><recommendations>Ask</recommendations></Asks>' +
        '<Aims><recommendations><bold>Aim:</bold> text</recommendations></Aims>' +
        '</AsksAims></Story></Story>'
    ));
    const box = result.children[0];
    const asksAims = result.children[1];

    expect(box).toMatchObject({
      type: 'component',
      name: 'Box',
      props: { index: '1.1', types: ['Physical', 'Social'] },
    });
    expect(asksAims).toMatchObject({
      type: 'component',
      name: 'AsksAims',
    });
    expect(asksAims.children[0].children[0].type).toBe('paragraph');
    expect(asksAims.children[1].children[0].type).toBe('paragraph');
  });

  it.each([
    ['paragraph', '<normal>Paragraph text</normal>', 'paragraph'],
    ['heading', '<h2>Heading text</h2>', 'heading'],
    ['unordered list', '<bullet-list>List item</bullet-list>', 'list'],
    ['ordered list', '<numbered-list>List item</numbered-list>', 'list'],
    ['quote', '<quote>Quoted text</quote>', 'quote'],
    ['quote author', '<quote-author>Author</quote-author>', 'quoteAuthor'],
    ['figure', '<fig href_fmt="figure.jpg"></fig>', 'figure'],
    ['endnote reference', '<normal>Text<endnotes-ref endnoteId="n1"/></normal>', 'paragraph'],
    ['table', '<Table><Cell>Cell text</Cell></Table>', 'table'],
    ['typology insight', '<toh-body-box>p1.3</toh-body-box>', 'component'],
  ])('normalizes an XML %s node', (_label, xml, expectedType) => {
    const result = convertToChapterTree(chapterWith(xml));
    const node = expectedType === 'paragraph'
      ? result.children[0]
      : result.children[0];

    expect(node.type).toBe(expectedType);
  });

  it('normalizes inline text, strong and emphasis nodes', () => {
    const result = convertToChapterTree(chapterWith(
      '<normal>Text <bold>strong</bold> <regular-italic>emphasis</regular-italic></normal>'
    ));

    expect(result.children[0].children.map((child) => child.type)).toEqual([
      'text', 'strong', 'text', 'emphasis',
    ]);
  });

  it('normalizes table cells and header cells', () => {
    const result = convertToChapterTree(chapterWith(
      '<Table><Cell>Body cell</Cell><header-cell>Header cell</header-cell></Table>'
    ));

    expect(result.children[0].children.map((child) => child.type)).toEqual([
      'tableCell', 'tableHeaderCell',
    ]);
  });

  it('normalizes explicit application components', () => {
    const result = convertToChapterTree(chapterWith(
      '<Box index="1.1" types="Physical"><normal>Box text</normal></Box>' +
      '<ContributorTag><Contributor><ContributorName>Name</ContributorName>' +
      '<ContributorEntity>Entity</ContributorEntity><ContributorRole>Role</ContributorRole>' +
      '</Contributor></ContributorTag>' +
      '<AsksAims><Asks><recommendations>Ask</recommendations></Asks>' +
      '<Aims><recommendations>Aim</recommendations></Aims></AsksAims>' +
      '<TohInsight types="Physical"/><Anchor index="1"/>' +
      '<ChapterImage imagePath="/image.jpg"/><SmallQuote>Quote</SmallQuote>' +
      '<SmallQuoteAuthor>Author</SmallQuoteAuthor><Definition>Definition</Definition>' +
      '<DefinitionDescription>Description</DefinitionDescription>' +
      '<Reccomendations>Recommendation</Reccomendations>' +
      '<ReccomendationsTitle>Recommendations</ReccomendationsTitle>'
    ));

    expect(result.children.filter((node) => node.type === 'component').map((node) => node.name))
      .toEqual([
        'Box',
        'ContributorTag',
        'AsksAims',
        'TohInsight',
        'Anchor',
        'ChapterImage',
        'SmallQuote',
        'SmallQuoteAuthor',
        'Definition',
        'DefinitionDescription',
        'Reccomendations',
        'ReccomendationsTitle',
      ]);
  });

  it('omits metadata and layout-only XML nodes', () => {
    const result = convertToChapterTree(chapterWith(
      '<chapter-number>Chapter 1</chapter-number>' +
      '<chapter-subtitle>Subtitle</chapter-subtitle>' +
      '<definition-icon/><return/><source/><toc-page-number/><toh-next/><img-4c/>'
    ));

    expect(result.children ?? []).toEqual([]);
    expect(result.title).toBe('T');
    expect(result.subtitle).toBe('Subtitle');
  });

  it('normalizes the complete Chapter 1 pilot XML', async () => {
    const xml = await parseXmlFile(
      path.resolve('src/reports/en/wdr25/chapter-01.xml')
    );
    const result = convertToChapterTree(xml, {
      locale: 'en',
      reportSlug: 'wdr25',
      chapterNumber: 1,
      assetBasePath: '/wdr25/chapter-01',
    });

    expect(result.title).toContain('Understanding harmful information');
    expect(result.children.filter((node) => node.type === 'component' && node.name === 'Box'))
      .toHaveLength(14);
    expect(result.children.filter((node) => node.type === 'component' && node.name === 'AsksAims'))
      .toHaveLength(1);
  });

  it.each([
    ['missing Box index', '<Box types="physical"><normal>Text</normal></Box>'],
    ['invalid Box type', '<Box index="1.1" types="unknown"><normal>Text</normal></Box>'],
    ['invalid Box link', '<Box index="1.1" types="physical" arrowHref="javascript:bad"><normal>Text</normal></Box>'],
    ['unknown component attribute', '<Box index="1.1" types="physical" onclick="bad"><normal>Text</normal></Box>'],
  ])('rejects %s', (_label, xml) => {
    expect(() => convertToChapterTree(chapterWith(xml))).toThrow(XmlChapterError);
  });

  it.each([
    ['ContributorTag child', '<ContributorTag><normal>Text</normal></ContributorTag>'],
    ['Contributor child', '<Contributor><ContributorName>Name</ContributorName><normal>Text</normal></Contributor>'],
    ['AsksAims ordering', '<AsksAims><Aims><recommendations>Aim</recommendations></Aims><Asks><recommendations>Ask</recommendations></Asks></AsksAims>'],
    ['Asks child', '<Asks><normal>Text</normal></Asks>'],
  ])('rejects invalid explicit structure: %s', (_label, xml) => {
    expect(() => convertToChapterTree(chapterWith(xml))).toThrow(XmlChapterError);
  });
});
