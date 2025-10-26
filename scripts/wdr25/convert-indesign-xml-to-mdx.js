#!/usr/bin/env node
/**
 * Convert InDesign-like XML to MDX using xml-js and remark
 *
 * Usage:
 *   node scripts/wdr25/convert-indesign-xml-to-mdx.js \
 *     --input scripts/wdr25/data/WDR25-CHAPTER-02-empty.xml \
 *     --output scripts/wdr25/output/chapter-02.mdx
 */

const fs = require('fs');
const path = require('path');
const { xml2js } = require('xml-js');
// unified/remark-stringify not required; we directly use mdast-util-to-markdown
const { mdxToMarkdown } = require('mdast-util-mdx');
const { toMarkdown } = require('mdast-util-to-markdown');
/**
 * Simple argv parser for --key value pairs
 */
function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' || a === '-i') args.input = argv[++i];
    else if (a === '--output' || a === '-o') args.output = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.log(`\nConvert InDesign-like XML to MDX\n\nUsage:\n  node ${path.relative(process.cwd(), __filename)} --input <file.xml> --output <file.mdx>\n`);
}

/**
 * Utilities for building a Markdown AST (mdast)
 */
function text(value) {
  // Do not append newlines inside text nodes; spacing is handled by join()
  return { type: 'text', value: value?.replace(/\n/g, '') ?? '' };
}

function paragraph(value) {
  return { type: 'paragraph', children: [text(value)] };
}

function heading(depth, value) {
  return { type: 'heading', depth, children: [text(value)] };
}

function blockquote(value) {
  return { type: 'blockquote', children: [paragraph(value)] };
}

function html(raw) {
  return { type: 'html', value: raw };
}

function image(url, alt = '') {
  return { type: 'image', url, alt };
}

function mdxElement(name, children = [], attrs = {}) {
  const attributes = Object.entries(attrs).map(([key, value]) => ({
    type: 'mdxJsxAttribute',
    name: key,
    value,
  }));
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes,
    children,
  };
}

function orderedList(items) {
  return {
    type: 'list',
    ordered: true,
    start: 1,
    spread: false,
    children: items.map((value) => ({ type: 'listItem', spread: false, children: [paragraph(value)] })),
  };
}

function unorderedList(items) {
  return {
    type: 'list',
    ordered: false,
    spread: false,
    children: items.map((value) => ({ type: 'listItem', spread: false, children: [paragraph(value)] })),
  };
}

/**
 * Extract plain text from an xml-js element subtree
 */
function extractText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  const els = node.elements || [];
  return els.map(extractText).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Convert xml-js elements into mdast children
 */
function convertElements(elements, context = {}) {
  const out = [];
  let i = 0;
  const take = () => elements[i++];
  const peek = () => elements[i];

  const pushTOHComment = (value) => {
    if (!value) return;
    out.push(html(`{/* TOH: ${value.replace(/\*/g, '\\*')} */}`));
  };

  while (i < elements.length) {
    const node = take();
    if (!node || node.type !== 'element') continue;
    const name = node.name;

    // Group consecutive numbered-list items into one list
    if (name === 'numbered-list') {
      const items = [extractText(node)];
      while (peek() && peek().type === 'element' && peek().name === 'numbered-list') {
        items.push(extractText(take()));
      }
      out.push(orderedList(items));
      continue;
    }

    // Group consecutive spotlight bullet list items into one unordered list
    if (name === 'normal-spotlight-bullet-list') {
      const items = [extractText(node)];
      while (peek() && peek().type === 'element' && peek().name === 'normal-spotlight-bullet-list') {
        items.push(extractText(take()));
      }
      out.push(unorderedList(items));
      continue;
    }

    // SideNote block: title + multiple contributions that follow
    if (name === 'h1-sidenote-context') {
      const title = extractText(node);
      const parts = [];
      while (peek() && peek().type === 'element' && /^sidenotes-/.test(peek().name)) {
        parts.push(extractText(take()));
      }
      const sideChildren = [
        { type: 'paragraph', children: [{ type: 'strong', children: [text(title)] }] },
        ...parts.map((p) => paragraph(p)),
      ];
      out.push(mdxElement('SideNote', sideChildren));
      continue;
    }

    // Contributors group: name + role/affiliation lines
    if (name === 'h1-contributor') {
      const nameText = extractText(node);
      const blocks = [mdxElement('Contributors', [paragraph(nameText)])];
      while (peek() && peek().type === 'element' && /^(contributor|contributor-role)$/.test(peek().name)) {
        const n = take();
        if (n.name === 'contributor') {
          blocks.push(mdxElement('Contributors', [paragraph(extractText(n))]));
        } else if (n.name === 'contributor-role') {
          blocks.push(mdxElement('ContributorRole', [paragraph(extractText(n))]));
        }
      }
      out.push(...blocks);
      continue;
    }

    // Contributor spotlight block (trio of name/role/position in varying order)
    if (name === 'h1-contributor-spotlight') {
      // Not present in sample; fall through
    }

    switch (name) {
      case 'chapter-title':
        context.title = extractText(node);
        break;
      case 'subchapter-title':
        context.subtitle = extractText(node);
        break;
      case 'chapter-quote':
        out.push(mdxElement('ChapterQuote', [paragraph(extractText(node))]));
        break;
      case 'small-quote':
        out.push(mdxElement('SmallQuote', [paragraph(extractText(node))]));
        break;
      case 'small-quote-author':
        out.push(mdxElement('SmallQuoteAuthor', [paragraph(extractText(node))]));
        break;
      case 'h1':
        out.push(heading(1 + (context.baseHeadingOffset || 0), extractText(node)));
        break;
      case 'h2':
        out.push(heading(2 + (context.baseHeadingOffset || 0), extractText(node)));
        break;
      case 'heading-3':
        out.push(heading(3 + (context.baseHeadingOffset || 0), extractText(node)));
        break;
      case 'h1-spotlight':
        out.push(mdxElement('Spotlight', [paragraph(extractText(node))]));
        break;
      case 'normal':
      case 'normal-first':
      case 'normal-spotlight':
      case 'normal-spotlight-first':
        out.push(paragraph(extractText(node)));
        break;
      case 'caption': {
        const cap = extractText(node);
        out.push(html(`<em>${escapeHtml(cap)}</em>`));
        break;
      }
      case 'toh':
      case 'toh-next':
        pushTOHComment(extractText(node));
        break;
      case 'img': {
        const hrefFmt = node.attributes?.href_fmt || node.attributes?.href || '';
        const url = hrefFmt.startsWith('images/') ? `/${hrefFmt}` : hrefFmt.replace('file://', '');
        out.push(image(url, ''));
        break;
      }
      case 'img-4c': {
        out.push(html('{/* TODO: 4-column image placeholder */}'));
        break;
      }
      // Author/title blocks like h1c1/h2c1 etc.
      case 'h1c1':
      case 'h1c2':
      case 'h1-ebn':
        out.push(heading(1 + (context.baseHeadingOffset || 0), extractText(node)));
        break;
      case 'h2c1':
      case 'h2c2':
        out.push(heading(2 + (context.baseHeadingOffset || 0), extractText(node)));
        break;
      case 'h3c2':
        out.push(heading(3 + (context.baseHeadingOffset || 0), extractText(node)));
        break;
      default: {
        // Unhandled tags: use paragraph fallback if they contain text
        const txt = extractText(node);
        if (txt) out.push(paragraph(txt));
        break;
      }
    }
  }

  return { nodes: out, context };
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
const joinOneNewlineAtRoot = (left, right, parent) => {
// Only affect top-level blocks
// if (!parent || parent.type !== 'root') return;
// // Keep default spacing inside lists
// if (left.type === 'list' || right.type === 'list' || left.type === 'listItem' || right.type === 'listItem') return;
  // 1 = one newline between blocks instead of the default blank line (2)
  
  // if (left.type === 'paragraph' && right.type === 'paragraph') {
  //   return 1; // Ensure one blank line
  // }
  return 1; // Let default behavior handle other cases
};

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.input || !args.output) {
    usage();
    if (!args.input || !args.output) process.exit(1);
  }

  const xml = fs.readFileSync(args.input, 'utf8');
  const tree = xml2js(xml, { compact: false, trim: true, ignoreDeclaration: true });

  // Find Root elements array
  const xmlRoot = (tree.elements || []).find((e) => e.type === 'element' && e.name === 'Root');
  if (!xmlRoot) {
    throw new Error('Invalid XML: missing <Root>');
  }
  const elements = xmlRoot.elements || [];

  // Flatten any nested Story blocks by inlining their children for sequential processing
  const flattened = [];
  for (const el of elements) {
    if (el.type === 'element' && el.name === 'Story') {
      if (Array.isArray(el.elements)) flattened.push(...el.elements);
    } else {
      flattened.push(el);
    }
  }

  const { nodes, context } = convertElements(flattened, { baseHeadingOffset: 0 });

  // Prepend imports and named exports via mdxjsEsm nodes
  const importNode = {
    type: 'mdxjsEsm',
    value:
      "import {\n  ChapterQuote,\n  ContributorRole,\n  ContributorSpotlight,\n  ContributorSpotlightName,\n  ContributorSpotlightPosition,\n  ContributorSpotlightRole,\n  Contributors,\n  SideNote,\n  SmallQuote,\n  SmallQuoteAuthor,\n  Spotlight,\n} from '@/components/CustomComponents';\n",
    data: { estree: null },
  };

  const exportNodes = [];
  if (context.title) {
    exportNodes.push({ type: 'mdxjsEsm', value: `export const title = ${JSON.stringify(context.title)};\n`, data: { estree: null } });
  }
  if (context.subtitle) {
    exportNodes.push({ type: 'mdxjsEsm', value: `export const subtitle = ${JSON.stringify(context.subtitle)};\n`, data: { estree: null } });
  }

  const mdRoot = { type: 'root', children: [importNode, ...exportNodes, ...nodes] };

  fs.writeFileSync(args.output.replace('.mdx', '') + '_mast.json', JSON.stringify(mdRoot, null, 2));

  // Build md content with remark and mdx stringifier extensions
  const file = toMarkdown(mdRoot, {
    listItemIndent: 'one',
    allowDangerousHtml: true,
    join: [joinOneNewlineAtRoot],
    extensions: [mdxToMarkdown()]
  });

  const outDir = path.dirname(args.output);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(args.output, file);
  console.log(`Wrote MDX: ${path.relative(process.cwd(), args.output)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
