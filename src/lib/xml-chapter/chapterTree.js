import { XmlChapterError } from './errors.js';
import { parseComponentProps, validateComponentNode } from './componentRegistry.js';
import { parseImageAttributes } from './attributeParsers.js';

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
const endnoteReference = (id) => node('endnoteReference', { id });
const endnote = (id, n, children = []) => node('endnote', { id, n }, children);
const endnotes = (children = []) => node('endnotes', {}, children);
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
  h2: 2, 
  'h2-box': 3,
  h3: 3, 
  'h3-box': 4, 
  'heading-3': 3, 
  h4: 4, 
  'h1-tables': 2, 
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
  'EndnotesLink',
  'ColumParagraphs',
  'ColumParagraph',
]);

/** Heading shown above the endnote list, by locale. */
const ENDNOTES_HEADING = { en: 'Endnotes' };

/** Maps plain-data endnote and figure nodes back to their XML nodes, for error locations. */
const sourceOf = new WeakMap();

/** Figure nodes (ChapterImage or box Anchor) that receive the next figure number. */
const numberedFigures = new WeakSet();

/** Default alt text for a box figure's fig that sits inside ColumParagraphs, away from its title. */
const figAlt = new WeakMap();

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
  const result = coalesceLists(convertBlocks(childrenOf(story), story));
  const headingIds = new Map();

  // Number the endnote references and append the endnote list (with its heading).
  const endnoteList = convertEndnotes(root, context);
  resolveEndnoteReferences(result, endnoteList);
  if (endnoteList) {
    result.push(heading(1, endnoteList.heading, 'endnotes'), endnotes(endnoteList.items));
  }

  // Walk the whole tree in document order (including headings nested inside
  // components such as Box) so every heading gets a unique id and a TOC entry.
  const headings = [];
  /** Assigns unique ids to headings and collects them in document order. */
  const collectHeadings = (nodes) => {
    for (const n of nodes) {
      if (n?.type === 'heading') {
        const base = n.id || slug(n.value);
        const count = (headingIds.get(base) || 0) + 1;
        headingIds.set(base, count);
        n.id = count === 1 ? base : `${base}-${count}`;
        headings.push(n);
      }
      if (Array.isArray(n?.children)) collectHeadings(n.children);
    }
  };
  collectHeadings(result);

  numberFigures(result, context.chapterNumber);

  const tableOfContents = buildTableOfContents(headings);
  return chapter(result, { ...context, title, subtitle, tableOfContents });
}

/** Reads the `<endnotes>` section, wherever it sits in the XML, into plain endnote nodes. */
function convertEndnotes(root, context) {
  let section = null;
  /** Finds the first `<endnotes>` element. */
  const visit = (n) => {
    if (section) return;
    if (n?.type === 'element' && n.name === 'endnotes') section = n;
    else childrenOf(n).forEach(visit);
  };
  visit(root);
  if (!section) return null;

  const locale = context.locale ?? 'en';
  const heading = ENDNOTES_HEADING[locale];
  if (!heading) throw new XmlChapterError(`No endnotes heading is defined for locale "${locale}"`, { node: section });

  const byId = new Map();
  const numbers = new Set();
  const items = childrenOf(section).filter((c) => c.type === 'element').map((c) => {
    if (c.name !== 'endnote') throw new XmlChapterError(`Unexpected "${c.name}" in endnotes`, { node: c });

    const id = attr(c, 'endnoteId');
    const n = Number(attr(c, 'n'));

    if (!id) throw new XmlChapterError('endnote requires an endnoteId', { node: c, attribute: 'endnoteId' });
    if (!Number.isInteger(n) || n < 1) throw new XmlChapterError('endnote requires a positive integer n', { node: c, attribute: 'n' });
    if (byId.has(id)) throw new XmlChapterError(`Duplicate endnoteId "${id}"`, { node: c, attribute: 'endnoteId' });
    if (numbers.has(n)) throw new XmlChapterError(`Duplicate endnote number ${n}`, { node: c, attribute: 'n' });

    const textNode = childrenOf(c).find((e) => e.type === 'element' && e.name === 'endnote-text');
    if (!textNode) throw new XmlChapterError('endnote requires an endnote-text element', { node: c });

    const item = endnote(id, n, inlineChildren(textNode));
    sourceOf.set(item, c);
    byId.set(id, item);
    numbers.add(n);
    return item;
  });
  return { heading, items, byId };
}

/** Sets each reference's number from its endnote; every endnote needs exactly one reference. */
function resolveEndnoteReferences(nodes, endnoteList) {
  const referenced = new Set();
  /** Visits every node, and assigns a number to each endnote reference. */
  const visit = (list) => list.forEach((n) => {
    if (n?.type === 'endnoteReference') {
      const at = { node: sourceOf.get(n), attribute: 'endnoteId' };
      if (!n.id) throw new XmlChapterError('endnotes-ref requires an endnoteId', at);

      const target = endnoteList?.byId.get(n.id);
      if (!target) throw new XmlChapterError(`endnotes-ref points to unknown endnote "${n.id}"`, at);
      if (referenced.has(n.id)) throw new XmlChapterError(`Endnote "${n.id}" is referenced more than once`, at);

      referenced.add(n.id);
      n.n = target.n;
    }
    if (Array.isArray(n?.children)) visit(n.children);
  });
  visit(nodes);

  for (const item of endnoteList?.items ?? []) {
    if (!referenced.has(item.id)) {
      throw new XmlChapterError(`Endnote "${item.id}" is never referenced`, { node: sourceOf.get(item) });
    }
  }
}

/**
 * Builds a nested table of contents from a flat, document-ordered list of
 * heading nodes. Mirrors the output of `@stefanprobst/rehype-extract-toc`:
 * `{ depth, value, id, children? }`, where `children` exists only when deeper
 * headings follow.
 */
export function buildTableOfContents(headings) {
  const root = { depth: 0, children: [] };
  const parents = [];
  let previous = root;

  for (const { depth, value, id } of headings) {
    const entry = { depth, value };
    if (id != null) entry.id = id;

    if (entry.depth > previous.depth) {
      if (previous.children === undefined) previous.children = [];
      parents.push(previous);
    } else if (entry.depth < previous.depth) {
      while (parents[parents.length - 1].depth >= entry.depth) parents.pop();
    }

    parents[parents.length - 1].children.push(entry);
    previous = entry;
  }

  return root.children;
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
  if (n.type === 'text') {
    // Whitespace-only text between block-level elements is XML formatting, not content.
    // (Inline whitespace is handled separately in inlineChildren, which never routes text here.)
    return clean(n.value) ? text(n.value.replace(/\s+/g, ' ')) : null;
  }
  if (n.type !== 'element') return null;
  if (n.name === 'Story' || n.name === 'Root') return childrenOf(n).flatMap((c) => convertNode(c, false) || []);
  if (COMPONENTS.has(n.name)) return componentNode(n);
  if (n.name === 'endnotes') return null; // read separately by convertEndnotes
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
  if (n.name === 'h1-definition') {
    const children = inlineChildren(n);
    return children.length ? component('Definition', {}, children) : null;
  }
  if (n.name === 'normal-definition-first') {
    const children = inlineChildren(n);
    return children.length ? component('DefinitionDescription', {}, children) : null;
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
  if (n.name === 'quote') return component('SmallQuote', {}, inlineChildren(n));
  if (n.name === 'quote-author') return component('SmallQuoteAuthor', {}, inlineChildren(n));
  if (n.name === 'chapter-quote') return quote(inlineChildren(n));
  if (n.name === 'endnotes-ref') {
    const ref = endnoteReference(attr(n, 'endnoteId'));
    sourceOf.set(ref, n);
    return ref;
  }
  if (n.name === 'cite') return emphasis(inlineChildren(n));
  if (n.name === 'fig') return figureImage(n);
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
    n.name === 'source' || // a source with text is only valid after a figure (see convertBlocks)
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
  return component(name, props, convertBlocks(childrenOf(n), n));
}

/**
 * Converts block-level siblings. A figure run (`h1-figures-body`, optional
 * `h2-figures-body`, the fig, optional `source`) becomes one ChapterImage; a
 * wrapper holding only a fig is unwrapped to the figure.
 */
function convertBlocks(children, parent) {
  const nodes = children.filter(visible);

  /** Checks if the node at index `i` is an element with the given `name`. */
  const is = (i, name) => nodes[i]?.type === 'element' && nodes[i].name === name;

  const out = [];

  // Walk the nodes in order, looking for figure runs and other block-level content.
  for (let i = 0; i < nodes.length; i++) {
    // Check if a figure run starts here: an optional h1-figures-body, optional h2-figures-body, and a fig.
    const title = is(i, 'h1-figures-body') ? nodes[i++] : null;
    const subtitle = is(i, 'h2-figures-body') ? nodes[i++] : null;
    const boxTitle = !title && !subtitle && is(i, 'h1-fig-box') ? nodes[i++] : null;
    const runStart = title ?? subtitle ?? boxTitle;
    // A box figure may sit in a column beside text: h1-fig-box, then ColumParagraphs holding the fig.
    const columnLayout = boxTitle && is(i, 'ColumParagraphs') ? nodes[i] : null;
    const fig = columnLayout ? null : soleFig(nodes[i]);
    if (columnLayout) {
      const figs = childrenOf(columnLayout).flatMap((col) => childrenOf(col).map(soleFig).filter(Boolean));
      if (figs.length !== 1) {
        throw new XmlChapterError('"h1-fig-box" columns must contain exactly one fig', { node: columnLayout });
      }
      const titleText = clean(textValue(boxTitle));
      figAlt.set(figs[0], titleText);
      out.push(boxAnchor(titleText, figs[0]));
    }
    if (runStart && !fig && !columnLayout) throw new XmlChapterError(`"${runStart.name}" must be followed by a fig`, { node: runStart });

    // If we found a figure run, convert it into a ChapterImage (or an Anchor for a box figure).
    if (fig) {
      const titleText = title ?? boxTitle ? clean(textValue(title ?? boxTitle)) : undefined;
      const image = figureImage(fig, { alt: titleText });
      if (subtitle) image.props.imageSubtitle = clean(textValue(subtitle));
      if (is(i + 1, 'source')) {
        // A source with text is only valid after a figure (see convertNode). The source text becomes the image caption.
        const caption = inlineChildren(nodes[++i]);
        if (caption.length) image.caption = caption;
      }
      if (boxTitle) {
        out.push(boxAnchor(titleText, fig));
      } else if (title) {
        image.props.imageTitle = titleText;
        numberedFigures.add(image);
        sourceOf.set(image, fig);
      }
      out.push(image);
      continue;
    }

    if (is(i, 'source') && childrenOf(nodes[i]).some(visible)) {
      throw new XmlChapterError('"source" must follow a figure', { node: nodes[i] });
    }
    const value = convertNode(nodes[i], false, parent);
    if (value) out.push(...(Array.isArray(value) ? value : [value]));
  }
  return out;
}

/** Box figures show their title in a numbered Anchor above an untitled image, as in the MDX. */
function boxAnchor(titleText, fig) {
  const anchor = component('Anchor', { meta: '' }, [text(titleText)]);
  numberedFigures.add(anchor);
  sourceOf.set(anchor, fig);
  return anchor;
}

/** Merges consecutive top-level list items into one ordered or unordered list. */
function coalesceLists(nodes) {
  const result = [];
  for (const n of nodes) {
    if (n.type !== 'listItem') {
      result.push(n);
      continue;
    }
    // Numbered items carry a private `ordered` flag until they are merged.
    const ordered = n.ordered === true;
    delete n.ordered;
    const prev = result.at(-1);
    if (prev?.type === 'list' && prev.ordered === ordered) prev.children.push(n);
    else result.push(ordered ? orderedList([n]) : unorderedList([n]));
  }
  return result;
}

/** Gives each titled figure, in document order, the label `{chapterNumber}.{count}`. */
function numberFigures(nodes, chapterNumber) {
  let count = 0;
  /** Visits nodes in document order. */
  const visit = (list) => list.forEach((n) => {
    if (numberedFigures.has(n)) {
      if (chapterNumber == null) {
        throw new XmlChapterError('Numbering figures requires a chapterNumber', { node: sourceOf.get(n) });
      }
      const index = `${chapterNumber}.${++count}`;
      if (n.name === 'Anchor') n.props.meta = `Fig ${index}`;
      else n.props.imageIndex = index;
    }
    if (Array.isArray(n?.children)) visit(n.children);
  });
  visit(nodes);
}

/** Returns the fig itself, or the only fig inside a paragraph/anchor wrapper with no visible text. */
function soleFig(n) {
  if (n?.type !== 'element') return null;
  if (n.name === 'fig') return n;
  if (!BLOCK.has(n.name) && n.name !== 'anchor') return null;
  const content = childrenOf(n).filter(visible);
  return content.length === 1 && content[0].name === 'fig' ? content[0] : null;
}

/** Builds a ChapterImage from a fig's attributes (imagePath is required). */
function figureImage(fig, { alt } = {}) {
  const attributes = {};
  for (const name of ['imagePath', 'width', 'height', 'alt']) {
    if (attr(fig, name) !== undefined) attributes[name] = attr(fig, name);
  }
  const props = parseImageAttributes(attributes, fig);
  props.alt ??= alt ?? figAlt.get(fig) ?? '';
  return component('ChapterImage', props);
}
