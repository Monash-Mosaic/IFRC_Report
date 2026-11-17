import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderChapter, renderChildren } from '@/lib/xml-chapter/renderChapter';
import { COMPONENT_REGISTRY } from '@/lib/xml-chapter/componentRegistry';
import { parseXmlSource } from '@/lib/xml-chapter/parseXml';
import { convertToChapterTree } from '@/lib/xml-chapter/chapterTree';
import { SmallQuote, SmallQuoteAuthor } from '@/components/CustomComponents';

describe('XML chapter renderer', () => {
  it('registers a renderable component for every approved XML component', () => {
    expect(Object.entries(COMPONENT_REGISTRY).every(([, definition]) =>
      typeof definition.component === 'function'
    )).toBe(true);
  });

  it('renders normalized nodes using only approved intrinsic elements', () => {
    const tree = {
      type: 'chapter',
      children: [
        { type: 'heading', depth: 2, id: 'intro', children: [{ type: 'text', value: 'Intro' }] },
        { type: 'paragraph', children: [
          { type: 'text', value: 'A ' },
          { type: 'strong', children: [{ type: 'text', value: 'safe' }] },
        ] },
        { type: 'list', ordered: false, children: [
          { type: 'listItem', children: [{ type: 'text', value: 'One' }] },
        ] },
      ],
    };

    expect(renderToStaticMarkup(renderChapter(tree))).toBe(
      '<h2 id="intro" class="font-bold text-3xl text-balance">Intro</h2><p>A <strong>safe</strong></p><ul><li>One</li></ul>'
    );
  });

  it('renders publisher tables with custom Table components and Toh icons', () => {
    const tree = convertToChapterTree(parseXmlSource(
      '<Story><Story><chapter-title>T</chapter-title>' +
      '<h1-tables>Typology of harm</h1-tables>' +
      '<tables-left><Table xmlns:aid="http://ns.adobe.com/AdobeInDesign/4.0/" aid:tcols="3">' +
      '<Cell aid:theader="" aid:ccols="2"><header-cell>Type of harm</header-cell></Cell>' +
      '<Cell aid:theader="" aid:ccols="1"><header-cell>Examples of harm</header-cell></Cell>' +
      '<Cell aid:ccols="1"><toh>p1.3</toh></Cell>' +
      '<Cell aid:ccols="1"><normal-first-col>Physical</normal-first-col></Cell>' +
      '<Cell aid:ccols="1"><normal-last-col>Injury</normal-last-col></Cell>' +
      '</Table></tables-left></Story></Story>'
    ), { chapterNumber: 1 });
    const html = renderToStaticMarkup(renderChapter(tree));

    expect(html).toContain('Table 1.1');
    expect(html).toContain('Typology of harm');
    expect(html).toContain('id="typology-of-harm"');
    expect(html).toContain('border-separate');
    expect(html).toContain('Type of harm');
    expect(html).toContain('Physical');
    expect(html).toContain('<svg');
    expect(html).not.toMatch(/<h2[^>]*>Typology of harm<\/h2>/);
  });

  it('renders definition style tags with Definition and DefinitionDescription', () => {
    const tree = convertToChapterTree(parseXmlSource(
      '<Story><Story><chapter-title>T</chapter-title>' +
      '<h1-definition>Infodemic</h1-definition>' +
      '<normal-definition-first>An <bold>infodemic</bold> is too much information.</normal-definition-first>' +
      '</Story></Story>'
    ));
    const html = renderToStaticMarkup(renderChapter(tree));

    expect(html).toContain('Infodemic');
    expect(html).toContain('border-b-2');
    expect(html).toContain('<aside');
    expect(html).toContain('border-inline-start:4px_solid_#030303ff');
    expect(html).toContain('<strong>infodemic</strong>');
    expect(html).not.toContain('<h2');
  });

  it('does not turn unknown nodes into arbitrary React tags', () => {
    expect(renderChildren([{ type: 'script', props: { dangerouslySetInnerHTML: {} } }]))
      .toEqual([null]);
  });

  it('renders quotes with the SmallQuote and SmallQuoteAuthor components', () => {
    const tree = {
      type: 'chapter',
      children: [
        { type: 'component', name: 'SmallQuote', props: {}, children: [{ type: 'text', value: 'Quoted' }] },
        { type: 'component', name: 'SmallQuoteAuthor', props: {}, children: [{ type: 'text', value: 'Author' }] },
      ],
    };

    const expected = renderToStaticMarkup(
      <>
        <SmallQuote>Quoted</SmallQuote>
        <SmallQuoteAuthor>Author</SmallQuoteAuthor>
      </>
    );
    expect(renderToStaticMarkup(renderChapter(tree))).toBe(expected);
  });

  it('renders safe links, figures and captions', () => {
    const tree = {
      type: 'chapter',
      children: [
        {
          type: 'link',
          props: { href: '#section' },
          children: [{ type: 'text', value: 'Jump' }],
        },
        {
          type: 'figure',
          props: { src: '/image.webp', alt: 'Image', caption: 'Caption' },
        },
      ],
    };

    expect(renderToStaticMarkup(renderChapter(tree))).toContain(
      '<a href="#section">Jump</a><figure><img src="/image.webp" alt="Image"/><figcaption>Caption</figcaption></figure>'
    );
  });

  it('renders endnote references with their number and an endnote list with back links', () => {
    const tree = convertToChapterTree(parseXmlSource(
      '<Story><Story><chapter-title>T</chapter-title>' +
      '<normal>Claim<endnotes-ref endnoteId="x"/></normal></Story>' +
      '<endnotes><endnote endnoteId="x" n="1"><endnote-text>See <cite>Book</cite>. ' +
      '<EndnotesLink>www.who.int</EndnotesLink></endnote-text></endnote></endnotes></Story>'
    ), { locale: 'en' });
    const html = renderToStaticMarkup(renderChapter(tree));

    expect(html).toContain('<sup><a id="endnote-ref-1" href="#endnote-1">1</a></sup>');
    expect(html).toContain('<h1 id="endnotes"');
    expect(html).toContain('<li id="endnote-1" value="1"');
    expect(html).toContain('See <em>Book</em>.');
    expect(html).toContain('href="https://www.who.int"');
    expect(html).toContain('<a href="#endnote-ref-1" aria-label="Back to reference 1">↩</a>');
  });
});
