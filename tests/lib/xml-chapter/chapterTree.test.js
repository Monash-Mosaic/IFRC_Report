import path from 'node:path';
import { parseXmlSource, parseXmlFile } from '@/lib/xml-chapter/parseXml';
import { convertToChapterTree, selectNarrativeStory } from '@/lib/xml-chapter/chapterTree';
import { XmlChapterError } from '@/lib/xml-chapter/errors';

const ENDNOTES =
  '<endnotes><endnote endnoteId="n1" n="1"><endnote-text>Note</endnote-text></endnote></endnotes>';

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
    ['quote', '<quote>Quoted text</quote>', 'component'],
    ['quote author', '<quote-author>Author</quote-author>', 'component'],
    ['chapter quote', '<chapter-quote>Quoted text</chapter-quote>', 'quote'],
    ['figure', '<fig imagePath="/figure.jpg"></fig>', 'component'],
    ['endnote reference', `<normal>Text<endnotes-ref endnoteId="n1"/></normal>${ENDNOTES}`, 'paragraph'],
    ['table', '<Table><Cell>Cell text</Cell></Table>', 'table'],
    ['typology insight', '<toh-body-box>p1.3</toh-body-box>', 'component'],
  ])('normalizes an XML %s node', (_label, xml, expectedType) => {
    const result = convertToChapterTree(chapterWith(xml));
    const node = expectedType === 'paragraph'
      ? result.children[0]
      : result.children[0];

    expect(node.type).toBe(expectedType);
  });

  it('maps definition style tags to Definition and DefinitionDescription', () => {
    const result = convertToChapterTree(chapterWith(
      '<definition-icon></definition-icon>' +
      '<h1-definition>Infodemic </h1-definition>' +
      '<normal-definition-first>An <bold>infodemic</bold> is too much information.</normal-definition-first>'
    ));

    expect(result.children).toMatchObject([
      { type: 'component', name: 'Definition', props: {} },
      { type: 'component', name: 'DefinitionDescription', props: {} },
    ]);
    expect(result.children[0].children).toEqual([{ type: 'text', value: 'Infodemic' }]);
    expect(result.children[1].children.map((child) => child.type)).toEqual([
      'text', 'strong', 'text',
    ]);
    expect(result.tableOfContents).toEqual([]);
  });
  
  it('maps quote and quote-author tags to SmallQuote and SmallQuoteAuthor components', () => {
    const result = convertToChapterTree(chapterWith(
      '<quote>Quoted <bold>text</bold></quote><quote-author>Community member, Uganda </quote-author>'
    ));

    expect(result.children).toEqual([
      {
        type: 'component',
        name: 'SmallQuote',
        props: {},
        children: [
          { type: 'text', value: 'Quoted ' },
          { type: 'strong', children: [{ type: 'text', value: 'text' }] },
        ],
      },
      {
        type: 'component',
        name: 'SmallQuoteAuthor',
        props: {},
        children: [{ type: 'text', value: 'Community member, Uganda' }],
      },
    ]);
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
    expect(result.children.filter((node) => node.type === 'component' && node.name === 'Definition'))
      .toHaveLength(3);
    expect(result.children.filter((node) => node.type === 'component' && node.name === 'DefinitionDescription'))
      .toHaveLength(3);
    expect(result.tableOfContents.some((item) => /infodemic/i.test(item.value))).toBe(false);

    const figures = [];
    const visit = (nodes) => nodes.forEach((n) => {
      if (n.name === 'ChapterImage' || (n.name === 'Anchor' && n.props.meta)) figures.push(n);
      if (n.children) visit(n.children);
    });
    visit(result.children);
    expect(figures.map((n) => [n.name, n.props.meta ?? n.props.imageIndex, n.props.imagePath])).toEqual([
      ['Anchor', 'Fig 1.1', undefined],
      ['ChapterImage', undefined, '/wdr25/chapter-01/fig-1-1-c_opt.webp'],
      ['ChapterImage', '1.2', '/wdr25/chapter-01/c1-word-cloud.webp'],
      ['ChapterImage', '1.3', '/wdr25/chapter-01/Fig-1-3.webp'],
    ]);
    expect(JSON.stringify(result.tableOfContents)).not.toMatch(/Posts on X|AI Incident Tracker|Threat actors involved/);

    const box11 = result.children.find((n) => n.name === 'Box' && n.props.index === '1.1');
    const anchorAt = box11.children.findIndex((n) => n.name === 'Anchor');
    const columns = box11.children[anchorAt + 1];
    expect(columns.name).toBe('ColumParagraphs');
    const [textColumn, imageColumn] = columns.children;
    expect(textColumn.children.map((n) => n.type))
      .toEqual(['paragraph', 'paragraph', 'listItem', 'listItem', 'listItem', 'paragraph']);
    expect(imageColumn.children).toMatchObject([
      { name: 'ChapterImage', props: { imagePath: '/wdr25/chapter-01/fig-1-1-c_opt.webp', alt: 'Posts on X, November and December 2024' } },
    ]);
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

  describe('endnotes', () => {
    const withNotes = (body, notes) => convertToChapterTree(chapterWith(
      `${body}<endnotes>${notes}</endnotes>`
    ), { locale: 'en' });
    const note = (id, n, text = 'Note') =>
      `<endnote endnoteId="${id}" n="${n}"><endnote-text>${text}</endnote-text></endnote>`;

    it('numbers references from the endnote n and appends a heading and list', () => {
      const result = withNotes(
        '<normal>A<endnotes-ref endnoteId="b"/> B<endnotes-ref endnoteId="a"/></normal>',
        note('a', 1) + note('b', 2, 'See <cite>Title</cite> <EndnotesLink>www.who.int</EndnotesLink>')
      );
      const refs = result.children[0].children.filter((c) => c.type === 'endnoteReference');
      expect(refs.map((r) => r.n)).toEqual([2, 1]);
      expect(result.children.slice(1).map((c) => c.type)).toEqual(['heading', 'endnotes']);
      expect(result.tableOfContents).toEqual([{ depth: 1, value: 'Endnotes', id: 'endnotes' }]);
      const second = result.children[2].children[1];
      expect(second).toMatchObject({ type: 'endnote', id: 'b', n: 2 });
      expect(second.children.map((c) => c.type)).toEqual(['text', 'emphasis', 'text', 'component']);
    });

    it.each([
      ['a reference with no endnoteId', '<normal>A<endnotes-ref/></normal>', note('a', 1)],
      ['a reference to an unknown endnote', '<normal>A<endnotes-ref endnoteId="zz"/></normal>', note('a', 1)],
      ['an endnote referenced twice',
        '<normal>A<endnotes-ref endnoteId="a"/><endnotes-ref endnoteId="a"/></normal>', note('a', 1)],
      ['an endnote that is never referenced', '<normal>A</normal>', note('a', 1)],
      ['a duplicate endnote number',
        '<normal><endnotes-ref endnoteId="a"/><endnotes-ref endnoteId="b"/></normal>', note('a', 1) + note('b', 1)],
    ])('rejects %s', (_label, body, notes) => {
      expect(() => withNotes(body, notes)).toThrow(XmlChapterError);
    });

    it('rejects an endnotes section for a locale without a heading', () => {
      expect(() => convertToChapterTree(chapterWith(
        `<normal>A<endnotes-ref endnoteId="a"/></normal><endnotes>${note('a', 1)}</endnotes>`
      ), { locale: 'xx' })).toThrow(XmlChapterError);
    });
  });

  describe('figures', () => {
    const figures = (xml) => convertToChapterTree(chapterWith(xml), { locale: 'en', chapterNumber: 1 });

    it('renders an untitled fig as an unnumbered ChapterImage with empty alt', () => {
      const result = figures('<normal><fig imagePath="/wdr25/a.webp" href_fmt="images/a_fmt2.png"/></normal>');
      expect(result.children).toEqual([
        { type: 'component', name: 'ChapterImage', props: { imagePath: '/wdr25/a.webp', alt: '' } },
      ]);
    });

    it('folds a figure title, subtitle and source into one numbered ChapterImage', () => {
      const result = figures(
        '<h1>Intro</h1>' +
        '<h1-figures-body>AI Incident Tracker </h1-figures-body>' +
        '<h2-figures-body>Severity over time. </h2-figures-body>' +
        '<normal><fig imagePath="/wdr25/fig.webp"/></normal>' +
        '<source>Sources: <body-hyperlinks>MIT</body-hyperlinks> dashboards</source>'
      );
      expect(result.children[1]).toEqual({
        type: 'component',
        name: 'ChapterImage',
        props: {
          imagePath: '/wdr25/fig.webp',
          imageTitle: 'AI Incident Tracker',
          imageSubtitle: 'Severity over time.',
          imageIndex: '1.1',
          alt: 'AI Incident Tracker',
        },
        caption: expect.any(Array),
      });
      expect(result.children[1].caption.map((c) => c.value).join('')).toBe('Sources: MIT dashboards');
      expect(result.children).toHaveLength(2);
      expect(result.tableOfContents).toEqual([{ depth: 1, value: 'Intro', id: 'intro' }]);
    });

    it('renders a box figure as a numbered Anchor followed by an untitled ChapterImage', () => {
      const result = figures(
        '<h1-figures-body>First</h1-figures-body><fig imagePath="/a.webp"/>' +
        '<Box index="1.1" types="Physical"><h1-fig-box>Posts on X </h1-fig-box>' +
        '<anchor><fig imagePath="/b.webp" width="782" height="1366"/></anchor></Box>'
      );
      const box = result.children[1];
      expect(box.children).toEqual([
        { type: 'component', name: 'Anchor', props: { meta: 'Fig 1.2' }, children: [{ type: 'text', value: 'Posts on X' }] },
        { type: 'component', name: 'ChapterImage', props: { imagePath: '/b.webp', width: 782, height: 1366, alt: 'Posts on X' } },
      ]);
      expect(result.tableOfContents).toEqual([]);
    });

    it('places a box figure in two columns after its numbered Anchor', () => {
      const result = figures(
        '<Box index="1.1" types="Physical"><h1-fig-box>Posts on X </h1-fig-box>' +
        '<ColumParagraphs><ColumParagraph><normal-box>Text</normal-box></ColumParagraph>' +
        '<ColumParagraph><anchor><fig imagePath="/b.webp"/></anchor></ColumParagraph></ColumParagraphs></Box>'
      );
      expect(result.children[0].children).toEqual([
        { type: 'component', name: 'Anchor', props: { meta: 'Fig 1.1' }, children: [{ type: 'text', value: 'Posts on X' }] },
        {
          type: 'component', name: 'ColumParagraphs', props: {}, children: [
            { type: 'component', name: 'ColumParagraph', props: {}, children: [
              { type: 'paragraph', children: [{ type: 'text', value: 'Text' }] },
            ] },
            { type: 'component', name: 'ColumParagraph', props: {}, children: [
              { type: 'component', name: 'ChapterImage', props: { imagePath: '/b.webp', alt: 'Posts on X' } },
            ] },
          ],
        },
      ]);
    });

    it.each([
      ['a figure title with no fig', '<h1-figures-body>T</h1-figures-body><normal>Text</normal>'],
      ['a box figure title with no fig', '<h1-fig-box>T</h1-fig-box><normal>Text</normal>'],
      ['a source with text that follows no figure', '<normal>Text</normal><source>Sources: X</source>'],
      ['a fig without imagePath', '<fig href_fmt="images/a_fmt2.png"/>'],
      ['box figure columns with no fig',
        '<Box index="1.1" types="Physical"><h1-fig-box>T</h1-fig-box><ColumParagraphs><ColumParagraph><normal-box>x</normal-box></ColumParagraph></ColumParagraphs></Box>'],
      ['box figure columns with two figs',
        '<Box index="1.1" types="Physical"><h1-fig-box>T</h1-fig-box><ColumParagraphs><ColumParagraph><fig imagePath="/a.webp"/></ColumParagraph><ColumParagraph><fig imagePath="/b.webp"/></ColumParagraph></ColumParagraphs></Box>'],
      ['ColumParagraphs with a non-column child', '<ColumParagraphs><normal>x</normal></ColumParagraphs>'],
      ['ColumParagraphs with a count attribute', '<ColumParagraphs count="3"><ColumParagraph><normal>x</normal></ColumParagraph></ColumParagraphs>'],
    ])('rejects %s', (_label, xml) => {
      expect(() => figures(xml)).toThrow(XmlChapterError);
    });

    it('takes a source caption after any figure and ignores an empty source', () => {
      const result = figures(
        '<fig imagePath="/a.webp"/><source>Src A</source>' +
        '<h1-figures-body>T</h1-figures-body><fig imagePath="/b.webp"/><source></source>'
      );
      expect(result.children.map((n) => n.caption?.map((c) => c.value).join(''))).toEqual(['Src A', undefined]);
    });

    it('rejects a titled figure when no chapterNumber is given', () => {
      expect(() => convertToChapterTree(chapterWith(
        '<h1-figures-body>T</h1-figures-body><fig imagePath="/a.webp"/>'
      ))).toThrow(XmlChapterError);
    });
  });
});
