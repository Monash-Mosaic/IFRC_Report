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
const figure = (props = {}, children = []) => node('figure', { props }, children);
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
  'h1-fig-box': 2, 
  h2: 2, 
  'h2-box': 3,
  h3: 3, 
  'h3-box': 4, 
  'heading-3': 3, 
  h4: 4, 
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
  'EndnotesLink',
]);

/** Publisher typology codes used in `<toh>` cells and TohInsight body tags. */
const TOH_CODES = {
  'p1.3': 'Physical',
  'p3.19': 'Psychological',
  'p1.28': 'Social',
  'p1.17': 'Societal',
  'p3.17': 'Informational',
  'p1.20': 'Deprivational',
  'p3.25': 'Digital',
  'p5.10': 'Longitudinal',
};

/** Default column width classes for typology-style 3-column tables. */
const TABLE_COL_CLASSES = {
  3: ['w-[15%] md:w-[10%]', 'w-[35%] md:w-[20%]', 'w-[50%] md:w-[70%]'],
};

/** Heading shown above the endnote list, by locale. */
const ENDNOTES_HEADING = { en: 'Endnotes' };

/** Maps plain-data endnote nodes back to their XML nodes, for error locations. */
const sourceOf = new WeakMap();

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

  // Coalesce consecutive list items into a single list, attach table captions from
  // preceding h1-tables titles, and keep orphan titles as ordinary headings.
  const result = [];
  const headingIds = new Map();
  let pendingTableTitle = null;
  /** Flushes an unmatched table title as a depth-2 heading. */
  const flushTableTitle = () => {
    if (!pendingTableTitle) return;
    result.push(heading(
      2,
      pendingTableTitle.value,
      slug(pendingTableTitle.value),
      pendingTableTitle.children || [text(pendingTableTitle.value)]
    ));
    pendingTableTitle = null;
  };
  for (const n of raw) {
    if (n.type === 'tableTitle') {
      flushTableTitle();
      pendingTableTitle = n;
      continue;
    }
    if (n.type === 'component' && n.name === 'Table') {
      context.tableCount = (context.tableCount || 0) + 1;
      const index = context.chapterNumber != null
        ? `${context.chapterNumber}.${context.tableCount}`
        : String(context.tableCount);
      if (pendingTableTitle) {
        n.children = [
          component('TableCaption', { id: slug(pendingTableTitle.value) }, [
            component('TableLabel', { index }),
            text(' '),
            text(pendingTableTitle.value),
          ]),
          ...(n.children || []),
        ];
        pendingTableTitle = null;
      }
      result.push(n);
      continue;
    }
    flushTableTitle();
    if (n.type === 'listItem') {
      // Style tags are converted before coalescing; numbered lists are marked by
      // the private flag below while preserving the public plain-data shape.
      const ordered = n.ordered === true;
      const prev = result.at(-1);
      delete n.ordered;
      if (prev?.type === 'list' && prev.ordered === ordered) prev.children.push(n);
      else result.push(ordered ? orderedList([n]) : unorderedList([n]));
    } else {
      result.push(n);
    }
  }
  flushTableTitle();

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
    const types = clean(textValue(n)).split(/\s+/).map((x) => TOH_CODES[x]).filter(Boolean);
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
  if (n.name === 'h1-tables') {
    const value = clean(textValue(n));
    return value ? { type: 'tableTitle', value, children: [text(value)] } : null;
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
  if (n.name === 'fig') return figure({ src: attr(n, 'href_fmt') || attr(n, 'href'), alt: clean(textValue(n)) });
  if (n.name === 'anchor') return component('Anchor', { meta: `Fig ${attr(n, 'index') || ''}`.trim() }, inlineChildren(n));
  if (n.name === 'definition-icon') return null;
  if (n.name === 'caption') return paragraph(inlineChildren(n));
  if (n.name === 'tables-left') {
    const table = childrenOf(n).find((c) => c.type === 'element' && c.name === 'Table');
    return table ? convertPublisherTable(table) : null;
  }
  if (n.name === 'Table') return convertPublisherTable(n);
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
    n.name === 'img-4c' ||
    n.name === 'Cell' ||
    n.name === 'header-cell'
  ) return null;
  if (childrenOf(n).some(visible)) throw new XmlChapterError(`Unsupported visible XML tag "${n.name}"`, { node: n });
  return null;
}

/** Converts a publisher InDesign `<Table>` into custom table components. */
function convertPublisherTable(tableNode) {
  const columnCount = Number(attr(tableNode, 'aid:tcols')) || 3;
  const cells = childrenOf(tableNode).filter((c) => c.type === 'element' && c.name === 'Cell');
  const rows = groupTableCellsIntoRows(cells, columnCount);
  const headerRows = [];
  const bodyRows = [];
  for (const row of rows) {
    (isHeaderTableRow(row) ? headerRows : bodyRows).push(row);
  }

  const children = [];
  const colClasses = TABLE_COL_CLASSES[columnCount];
  if (colClasses) {
    children.push(component('TableColGroup', { columns: colClasses }));
  }
  if (headerRows.length) {
    children.push(component('TableHead', {}, headerRows.map((row) =>
      component('TableRow', {}, row.map((cell) => convertPublisherTableHeaderCell(cell)))
    )));
  }
  if (bodyRows.length) {
    children.push(component('TableBody', {}, bodyRows.map((row) =>
      component('TableRow', {}, row.map((cell, index) => convertPublisherTableBodyCell(cell, index)))
    )));
  }
  return component('Table', {}, children);
}

/** Groups flat InDesign table cells into rows using column spans. */
function groupTableCellsIntoRows(cells, columnCount) {
  const rows = [];
  let current = [];
  let width = 0;
  for (const cell of cells) {
    const span = Number(attr(cell, 'aid:ccols')) || 1;
    current.push(cell);
    width += span;
    if (width >= columnCount) {
      rows.push(current);
      current = [];
      width = 0;
    }
  }
  if (current.length) rows.push(current);
  return rows;
}

/** Returns whether a row is a header row. */
function isHeaderTableRow(row) {
  return row.some((cell) => {
    if (Object.prototype.hasOwnProperty.call(cell.attributes || {}, 'aid:theader')) return true;
    return childrenOf(cell).some((child) => child.type === 'element' && child.name === 'header-cell');
  });
}

/** Converts a publisher header cell into a TableHeaderCell component. */
function convertPublisherTableHeaderCell(cell) {
  const colSpan = Number(attr(cell, 'aid:ccols')) || 1;
  const props = { className: 'text-2xl' };
  if (colSpan > 1) props.colSpan = colSpan;
  const header = childrenOf(cell).find((child) => child.type === 'element' && child.name === 'header-cell');
  const content = header ? inlineChildren(header) : convertPublisherTableCellContent(cell);
  return component('TableHeaderCell', props, content);
}

/** Converts a publisher body cell into a TableCell component. */
function convertPublisherTableBodyCell(cell, columnIndex) {
  const colSpan = Number(attr(cell, 'aid:ccols')) || 1;
  const props = {};
  if (colSpan > 1) props.colSpan = colSpan;

  const toh = childrenOf(cell).find((child) => child.type === 'element' && child.name === 'toh');
  if (toh) {
    const type = TOH_CODES[clean(textValue(toh))];
    props.className = 'p-2';
    return component('TableCell', props, type ? [component('TohIcon', { type })] : []);
  }

  const hasFirstCol = childrenOf(cell).some((child) =>
    child.type === 'element' && child.name === 'normal-first-col'
  );
  props.className = hasFirstCol || columnIndex === 1 ? 'font-medium' : 'font-extralight';
  return component('TableCell', props, convertPublisherTableCellContent(cell));
}

/** Flattens publisher cell children into inline chapter nodes. */
function convertPublisherTableCellContent(cell) {
  const out = [];
  for (const child of childrenOf(cell)) {
    if (child.type === 'text') {
      const value = clean(child.value);
      if (!value) continue;
      if (out.length) out.push(text(' '));
      out.push(text(value));
      continue;
    }
    if (child.type !== 'element') continue;
    if (child.name === 'toh' || child.name === 'header-cell') continue;
    if (
      child.name === 'normal-first-col' ||
      child.name === 'normal-last-col' ||
      child.name === 'normal-last-col-next' ||
      BLOCK.has(child.name)
    ) {
      const piece = inlineChildren(child);
      if (out.length && piece.length) out.push(text(' '));
      out.push(...piece);
      continue;
    }
    const converted = convertNode(child, true, cell);
    if (!converted) continue;
    const piece = Array.isArray(converted) ? converted : [converted];
    if (out.length && piece.length) out.push(text(' '));
    out.push(...piece);
  }
  return out;
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
