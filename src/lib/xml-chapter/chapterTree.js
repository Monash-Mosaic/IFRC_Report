import { XmlChapterError } from './errors.js';
import { parseComponentProps, validateComponentNode } from './componentRegistry.js';

/** Plain-data constructors used by the XML chapter normalizer. */
export const node = (type, properties = {}, children = []) => ({
  type,
  ...properties,
  ...(children.length ? { children } : {}),
});

const text = (value) => ({ type: 'text', value: String(value) });
const paragraph = (children = []) => node('paragraph', {}, children);
const heading = (depth, value, id, children = [text(value)]) =>
  node('heading', { depth, id, value }, children);
const strong = (children = []) => node('strong', {}, children);
const emphasis = (children = []) => node('emphasis', {}, children);
const unorderedList = (children = []) => node('list', { ordered: false }, children);
const orderedList = (children = []) => node('list', { ordered: true }, children);
const listItem = (children = []) => node('listItem', {}, children);
const quote = (children = []) => node('quote', {}, children);
const quoteAuthor = (children = []) => node('quoteAuthor', {}, children);
const figure = (props = {}, children = []) => node('figure', { props }, children);
const endnoteReference = (id) => node('endnoteReference', { id });
const component = (name, props = {}, children = []) =>
  node('component', { name, props }, children);
const chapter = (children = [], properties = {}) =>
  node('chapter', properties, children);

const BLOCK = new Set([
  'normal', 
  'normal-tight', 
  'normal-super-tight', 
  'normal-first', 
  'normal-expanded',
  'normal-box', 
  'normal-box-alt', 
  'normal-box-tight', 
  'normal-box-expanded',
  'normal-box-expander-super', 
  'normal-definition', 
  'normal-definition-first',
  'normal-first-col', 
  'normal-last-col', 
  'normal-last-col-next',
]);

const HEADING = {
  'h1-introduction': 1, 
  h1: 1, 
  'h1-recommendations': 1, 
  'h1-conclusion': 1,
  'h1-box': 2, 
  'h1-fig-box': 2, 
  'h1-definition': 2, 
  h2: 2, 
  'h2-box': 3,
  h3: 3, 
  'h3-box': 4, 
  'heading-3': 3, 
  h4: 4, 
  'h1-tables': 2, 
  'h1-figures-body': 2,
  'h2-figures-body': 3, 
  'h1-chapter-toc-title': 2,
};

const BULLETS = new Set([
  'bullet-list', 
  'bullet-list-2c', 
  'normal-box-bullet-list', 
  'normal-spotlight-bullet-list',
]);

const NUMBERED = new Set([
  'numbered-list', 
  'normal-box-numbered-list'
]);

const COMPONENTS = new Set([
  'Box', 
  'ContributorTag', 
  'Contributor', 
  'ContributorName', 
  'ContributorEntity',
  'ContributorRole', 
  'AsksAims', 
  'Asks', 
  'Aims', 
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

/** Returns the child nodes of an XML node. */
const childrenOf = (n) => Array.isArray(n?.children) ? n.children : [];
/** Reads an attribute value from an XML node. */
const attr = (n, name) => n?.attributes?.[name] ?? n?.attributes?.find?.((a) => a.name === name)?.value;
/** Collapses whitespace and trims a string. */
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
/** Creates a stable URL-friendly identifier from text. */
const slug = (s) => clean(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-').replace(/-+/g, '-');
/** Determines whether an XML node contains visible content. */
const visible = (n) => n?.type === 'text' ? clean(n.value).length > 0 : true;

/** Normalizes a parsed XML chapter AST into a plain ChapterTree. */
export function convertToChapterTree(root, context = {}) {
  const story = selectNarrativeStory(root);

  // Extract metadata
  const titleNode = childrenOf(story).find((n) => n.type === 'element' && n.name === 'chapter-title');
  const subtitleNode = childrenOf(story).find((n) => n.type === 'element' && (n.name === 'chapter-subtitle' || n.name === 'h1-introduction'));
  const title = titleNode ? clean(textValue(titleNode)) : '';
  const subtitle = subtitleNode?.name === 'chapter-subtitle' ? clean(textValue(subtitleNode)) : '';

  // Convert the story children into normalized chapter nodes
  const raw = childrenOf(story).flatMap((n) => {
    const value = convertNode(n, false, story);
    return value ? (Array.isArray(value) ? value : [value]) : [];
  });

  // Coalesce consecutive list items into a single list and assign unique IDs to headings
  const result = [];
  const headingIds = new Map();
  for (const n of raw) {
    if (n.type === 'listItem') {
      // Style tags are converted before coalescing; numbered lists are marked by
      // the private flag below while preserving the public plain-data shape.
      const ordered = n.ordered === true;
      const prev = result.at(-1);
      delete n.ordered;
      if (prev?.type === 'list' && prev.ordered === ordered) prev.children.push(n);
      else result.push(ordered ? orderedList([n]) : unorderedList([n]));
    } else {
      if (n.type === 'heading') {
        const base = n.id || slug(n.value);
        const count = (headingIds.get(base) || 0) + 1;
        headingIds.set(base, count);
        n.id = count === 1 ? base : `${base}-${count}`;
      }
      result.push(n);
    }
  }
  const tableOfContents = result.filter((n) => n.type === 'heading')
    .map(({ value, id, depth }) => ({ value, id, depth }));
  return chapter(result, { ...context, title, subtitle, tableOfContents });
}

/** Selects the narrative Story element from a parsed XML tree. */
export function selectNarrativeStory(root) {
  const stories = [];
  /** Collects nested Story elements. */
  const visit = (n) => {
    if (n?.type === 'element' && n.name === 'Story') stories.push(n);
    childrenOf(n).forEach(visit);
  };
  visit(root);
  const story = stories.find((s) =>
    childrenOf(s).some((n) => n.type === 'element' && n.name === 'chapter-title')
  );
  if (!story) {
    throw new XmlChapterError('Expected a narrative Story element', { node: root });
  }
  return story;
}

/** Extracts plain text content from an XML node. */
function textValue(n) {
  return inlineChildren(n).map((x) => x.type === 'text' ? x.value : textValue(x)).join('');
}

/** Converts the children of an XML node into inline chapter nodes. */
function inlineChildren(n) {
  const out = [];
  let pending = '';
  /** Emits pending text as a normalized text node. */
  const flush = () => { if (pending) { out.push(text(pending)); pending = ''; } };
  childrenOf(n).forEach((child) => {
    if (child.type === 'text') { pending += child.value.replace(/\s+/g, ' '); return; }
    const converted = convertNode(child, true, n);
    if (!converted) return;
    flush();
    out.push(...(Array.isArray(converted) ? converted : [converted]));
  });
  flush();
  if (out[0]?.type === 'text') out[0].value = out[0].value.replace(/^\s+/, '');
  if (out.at(-1)?.type === 'text') out.at(-1).value = out.at(-1).value.replace(/\s+$/, '');
  return out.filter((x) => x.type !== 'text' || x.value.length);
}

/** Converts a publisher XML node into normalized chapter data. */
function convertNode(n, inline = false, parent = null) {
  if (!n) return null;
  if (n.type === 'text') return text(n.value.replace(/\s+/g, ' '));
  if (n.type !== 'element') return null;
  if (n.name === 'Story' || n.name === 'Root') return childrenOf(n).flatMap((c) => convertNode(c, false) || []);
  if (COMPONENTS.has(n.name)) return componentNode(n);
  if (n.name === 'chapter-number' || n.name === 'chapter-title' || n.name === 'chapter-subtitle') return null;
  if (n.name === 'toh-body-box' || n.name === 'toh-body') {
    const codeMap = {
      'p1.3': 'Physical', 
      'p3.19': 'Psychological', 
      'p1.28': 'Social',
      'p1.17': 'Societal', 
      'p3.17': 'Informational', 
      'p1.20': 'Deprivational',
      'p3.25': 'Digital',
    };
    const types = clean(textValue(n)).split(/\s+/).map((x) => codeMap[x]).filter(Boolean);
    return types.length ? component('TohInsight', { align: 'right', types }) : null;
  }
  if (HEADING[n.name]) {
    const value = clean(textValue(n));
    return value ? heading(HEADING[n.name], value, slug(value), inlineChildren(n)) : null;
  }
  if (BLOCK.has(n.name)) return inline ? inlineChildren(n) : paragraph(inlineChildren(n));
  if (BULLETS.has(n.name)) return listItem(inlineChildren(n));
  if (NUMBERED.has(n.name)) return { ...listItem(inlineChildren(n)), ordered: true };
  if (n.name === 'bold') return strong(inlineChildren(n));
  if (n.name === 'regular-italic' || n.name === 'light-italic' || n.name === 'sup') return emphasis(inlineChildren(n));
  if (n.name === 'quote' || n.name === 'chapter-quote') return quote(inlineChildren(n));
  if (n.name === 'quote-author') return quoteAuthor(inlineChildren(n));
  if (n.name === 'endnotes-ref') return endnoteReference(attr(n, 'endnoteId') || attr(n, 'id'));
  if (n.name === 'fig') return figure({ src: attr(n, 'href_fmt') || attr(n, 'href'), alt: clean(textValue(n)) });
  if (n.name === 'anchor') return component('Anchor', { meta: `Fig ${attr(n, 'index') || ''}`.trim() }, inlineChildren(n));
  if (n.name === 'definition-icon') return null;
  if (n.name === 'caption') return paragraph(inlineChildren(n));
  if (n.name === 'tables-left' || n.name === 'Table')
    return { type: 'table', children: childrenOf(n).flatMap((c) => convertNode(c, false) || []) };
  if (n.name === 'Cell')
    return { type: 'tableCell', children: childrenOf(n).flatMap((c) => convertNode(c, false) || []) };
  if (n.name === 'header-cell') return { type: 'tableHeaderCell', children: inlineChildren(n) };
  if (n.name === 'toh') return text(clean(textValue(n)));
  if (n.name === 'cross-reference-link' || n.name === 'link' || n.name === 'body-hyperlinks') return inlineChildren(n);
  if (n.name === 'normal-2c') return component('ReccomendationsTitle', {}, inlineChildren(n));
  if (n.name === 'recommendations') {
    return parent?.name === 'Asks' || parent?.name === 'Aims'
      ? paragraph(inlineChildren(n))
      : component('Reccomendations', {}, inlineChildren(n));
  }
  if (
    n.name === 'return' ||
    n.name === 'source' ||
    n.name === 'toc-page-number' ||
    n.name === 'toh' ||
    n.name === 'toh-next' ||
    n.name === 'img-4c'
  ) return null;
  if (childrenOf(n).some(visible)) throw new XmlChapterError(`Unsupported visible XML tag "${n.name}"`, { node: n });
  return null;
}

/** Converts an explicit application component into a chapter node. */
function componentNode(n) {
  const name = n.name;
  validateComponentNode(n);
  const props = parseComponentProps(n);
  if (name === 'AsksAims') {
    const names = childrenOf(n).filter((c) => c.type === 'element').map((c) => c.name);
    const asks = names.indexOf('Asks');
    const aims = names.indexOf('Aims');
    if (asks < 0 || aims < 0 || asks > aims) {
      throw new XmlChapterError('AsksAims requires Asks before Aims', { node: n });
    }
  }
  return component(name, props, childrenOf(n).flatMap((c) => {
    const value = convertNode(c, false, n);
    return value ? (Array.isArray(value) ? value : [value]) : [];
  }));
}
