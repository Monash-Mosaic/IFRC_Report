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
});
