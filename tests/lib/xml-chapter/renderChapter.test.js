import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderChapter, renderChildren } from '@/lib/xml-chapter/renderChapter';
import { COMPONENT_REGISTRY } from '@/lib/xml-chapter/componentRegistry';

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

    const html = renderToStaticMarkup(renderChapter(tree));
    expect(html).toContain('class="font-bold text-3xl text-balance"');
    expect(html).toContain('<p>A <strong>safe</strong></p>');
    expect(html).toContain('<ul class="');
    expect(html).toContain("list-['—']");
    expect(html).toContain('marker:text-[#ee2435]');
    expect(html).toContain('<li class="mb-3">One</li>');
  });

  it('renders ordered lists with red decimal markers', () => {
    const tree = {
      type: 'chapter',
      children: [
        { type: 'list', ordered: true, children: [
          { type: 'listItem', children: [{ type: 'text', value: 'First' }] },
          { type: 'listItem', children: [{ type: 'text', value: 'Second' }] },
        ] },
      ],
    };

    const html = renderToStaticMarkup(renderChapter(tree));
    expect(html).toContain('<ol class="');
    expect(html).toContain('list-decimal');
    expect(html).toContain('li::marker]:text-[#ee2435]');
    expect(html).toContain('<li class="mb-3">First</li>');
    expect(html).toContain('<li class="mb-3">Second</li>');
    expect(html.match(/<ol /g)).toHaveLength(1);
  });

  it('does not turn unknown nodes into arbitrary React tags', () => {
    expect(renderChildren([{ type: 'script', props: { dangerouslySetInnerHTML: {} } }]))
      .toEqual([null]);
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
