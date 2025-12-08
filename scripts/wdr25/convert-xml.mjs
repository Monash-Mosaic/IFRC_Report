import fs from 'fs/promises';
import path from 'path';
import { fromXml } from 'xast-util-from-xml';
import { visit } from 'unist-util-visit';
import flatMap from 'unist-util-flatmap';
import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxToMarkdown } from 'mdast-util-mdx';
import { paragraph, text, heading, list, listItem, image, strong } from 'mdast-builder';
import { toJs } from 'estree-util-to-js';
import { parseArgs } from 'node:util';
import * as prettier from 'prettier';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DEFAULTS = {
  sourceDir: path.join(__dirname, 'data'),
  outputDir: path.join(__dirname, 'output'),
  source: 'WDR25-CHAPTER-02-empty.xml',
  mdx: 'chapter-02.mdx',
};

const { values } = parseArgs({
  options: {
    'data-dir': { type: 'string' },
    source: { type: 'string', short: 's' },
    mdx: { type: 'string', short: 'm' },
  },
});

const resolveTargetPath = (root, filePath, fallback) => {
  const target = filePath ?? fallback;
  return path.isAbsolute(target) ? target : path.join(root, target);
};

const SOURCE_XML_PATH = resolveTargetPath(DEFAULTS.sourceDir, values.source, DEFAULTS.source);
const OUTPUT_MDX_PATH = resolveTargetPath(DEFAULTS.outputDir, values.mdx, DEFAULTS.mdx);

/**
 * Ensure the destination directory exists before writing files.
 * @param {string} targetPath
 * @returns {Promise<void>}
 */
const ensureParentDir = async (targetPath) => {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
};

/**
 * Create an mdxJsxFlowElement node so XML tags can become MDX components.
 * @param {string} name component name to render in MDX
 * @param {import('mdast').MdxJsxAttribute[]} [attributes]
 * @param {import('unist').Node[]} [children]
 * @returns {import('mdast').MdxJsxFlowElement}
 */
const mdxJsxEl = (name, attributes = [], children = []) => ({
  type: 'mdxJsxFlowElement',
  name,
  attributes,
  children,
});

/**
 * Generate an mdxjsEsm import block for the given MDX components.
 * @param {string} modelPath module specifier for the import
 * @param {string[]} [variables] named imports to pull from the module
 * @param {string} [defaultValue] optional default import identifier
 * @returns {import('mdast').MdxjsEsm}
 */
const importEsm = (modelPath, variables = [], defaultValue) => {
  const specifiers = variables.map((varName) => ({
    type: 'ImportSpecifier',
    imported: { type: 'Identifier', name: varName },
    local: { type: 'Identifier', name: varName },
  }));
  if (defaultValue) {
    specifiers.unshift({
      type: 'ImportDefaultSpecifier',
      local: { type: 'Identifier', name: defaultValue },
    });
  }
  return {
    type: 'mdxjsEsm',
    value: toJs({
      type: 'Program',
      body: [
        {
          type: 'ImportDeclaration',
          specifiers,
          source: { type: 'Literal', value: modelPath },
        },
      ],
      sourceType: 'module',
    }).value,
  };
};
/**
 * Emit an mdxjsEsm export that exposes metadata (title, subtitle, etc.).
 * @param {string} varName identifier to export
 * @param {string} value literal value to assign
 * @returns {import('mdast').MdxjsEsm}
 */
const exportEsm = (varName, value) => {
  return {
    type: 'mdxjsEsm',
    value: toJs({
      type: 'Program',
      body: [
        {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'VariableDeclaration',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: varName },
                init: { type: 'Literal', value },
              },
            ],
            kind: 'const',
          },
          specifiers: [],
          source: null,
        },
      ],
      sourceType: 'module',
    }).value.trimEnd('\n'),
  };
};

/**
 * Normalize the XML AST by removing empty nodes and flattening helpers.
 * @param {import('unist').Node} node
 * @param {number} index
 * @param {import('unist').Parent} parent
 * @returns  {import('unist').Node[]}
 */
const normalisedXmlAstFn = (node, index, parent) => {
  if (node && node.type === 'text' && node.value.replace(/\s+/g, ' ').trim() === '') {
    return []; // Remove empty text nodes
  }
  if (node.type === 'element' && node.name === 'Story') {
    return node.children;
  }
  if (node.type === 'instruction') {
    return [];
  }
  if (node.name === 'Root') {
    return node.children;
  }
  return [node];
};
/**
 * Remove extra spaces and new lines from arbitrary text input.
 * @param {unknown} input value to sanitize
 * @returns {string}
 */
const normalizedString = (input) =>
  String(input ?? '')
    .replace(/\s+/g, ' ')
    .trim();
/**
 * Normalize a text child node while preserving non-text children.
 * @param {import('unist').Node} child potential text child
 * @returns {import('unist').Node}
 */
const normaliseChildrenText = (child) => {
  if (child?.type !== 'text') return child;
  return text(normalizedString(child.value));
};
/**
 * Collect all text children from a node, applying normalization.
 * @param {import('unist').Node & { children?: import('unist').Node[] }} node
 * @returns {import('unist').Literal[]}
 */
const extractTextChildren = (node) =>
  (node.children || []).filter((child) => child?.type === 'text').map(normaliseChildrenText);
/**
 * Convenience helper for flattening text child content into a string.
 * @param {import('unist').Node & { children?: import('unist').Node[] }} node
 * @returns {string}
 */
const getTextContent = (node) =>
  extractTextChildren(node)
    .map((n) => n.value)
    .join(' ');

/**
 * Convert XML element nodes into MDX/MD AST nodes expected by the renderer.
 * @param {import('unist').Node} node
 * @param {number} index
 * @param {import('unist').Parent} parent
 * @returns  {import('unist').Node[]}
 */
const convertToMDXAst = (node, index, parent) => {
  if (!node || node.type !== 'element') {
    return [node];
  }

  switch (node.name) {
    case 'chapter-title':
      return [exportEsm('title', getTextContent(node))];
    case 'subchapter-title':
      return [exportEsm('subtitle', getTextContent(node))];
    case 'caption':
      return [mdxJsxEl('Caption', [], extractTextChildren(node))];
    case 'h1-box':
    case 'h1-spotlight':
      return [mdxJsxEl('Spotlight', [], extractTextChildren(node))];
    case 'h1-recommendations':
    case 'h1':
      return [heading(1, extractTextChildren(node))];
    case 'h2':
      return [heading(2, extractTextChildren(node))];
    case 'h3':
    case 'heading-3':
      return [heading(3, extractTextChildren(node))];
    case 'h4':
      return [heading(4, extractTextChildren(node))];
    case 'chapter-quote':
      return [mdxJsxEl('ChapterQuote', [], extractTextChildren(node))];
    case 'introduction':
      return [mdxJsxEl('Introduction', [], extractTextChildren(node))];
    case 'normal-spotlight':
    case 'normal':
    case 'normal-spotlight-first':
    case 'normal-box':
    case 'normal-box-alt':
    case 'normal-first':
    case 'recommendations':
    case 'normal-2c':
      return [paragraph(extractTextAndBoldChildren(node))];
    case 'bold':
      return [strong(extractTextChildren(node))];
    case 'numbered-list':
      return [listItem(extractTextChildren(node))];
    case 'numbered-list-group':
      return [list('ordered', node.children)];
    case 'h1-c1':
    case 'h1-c2':
    case 'h1-span':
    case 'h1-3c-c1':
    case 'h1-3c-c2':
    case 'h1-3c-c3':
    case 'h1-contributor-spotlight':
      return [mdxJsxEl('H1Contributor', [], extractTextChildren(node))];
    case 'contributor-name-spotlight':
      return [mdxJsxEl('ContributorName', [], extractTextChildren(node))];
    case 'contributor-position-spotlight':
      return [mdxJsxEl('ContributorPosition', [], extractTextChildren(node))];
    case 'h2-c2':
    case 'h2-c1':
    case 'h2-span':
    case 'h2-3c-c1':
    case 'h2-3c-c2':
    case 'h2-3c-c3':
    case 'contributor':
      return [mdxJsxEl('Contributors', [], node.children)];
    case 'bullet-list-2c':
    case 'bullet-list':
    case 'normal-box-bullet-list':
    case 'normal-spotlight-bullet-list':
      return [listItem(extractTextChildren(node))];
    case 'bullet-list-group':
      return [list('unordered', node.children)];
    case 'h3-c1':
    case 'h3-c2':
    case 'h3-span':
    case 'h3-3c-c3':
    case 'contributor-role':
      return [mdxJsxEl('ContributorRole', [], extractTextChildren(node))];
    case 'h1-contributor':
      return [mdxJsxEl('H1Contributor', [], extractTextChildren(node))];
    case 'contributor-group':
      return [mdxJsxEl('ContributorGroup', [], node.children)];
    case 'h1.fig':
      return [mdxJsxEl('H1Fig', [], extractTextChildren(node))];
    case 'h1-ebn':
      return [mdxJsxEl('H1Ebn', [], extractTextChildren(node))];
    case 'toh':
    case 'toh-next':
    case 'img-4c':
      return [];
    case 'img':
      return [paragraph([image(node.attributes?.href_fmt || '')])];
    case 'small-quote':
      return [mdxJsxEl('SmallQuoteContent', [], extractTextChildren(node))];
    case 'small-quote-group':
      return [mdxJsxEl('SmallQuoteGroup', [], node.children)];
    case 'small-quote-author':
      return [mdxJsxEl('SmallQuoteAuthor', [], extractTextChildren(node))];
    case 'h1-sidenote-context':
      return [mdxJsxEl('SidenoteContext', [], extractTextChildren(node))];
    case 'sidenotes-contributions-first':
      return [mdxJsxEl('SidenotesContributionsFirst', [], extractTextChildren(node))];
    case 'sidenote':
      return [mdxJsxEl('Sidenote', [], node.children)];
    case 'h1-definition':
      return [mdxJsxEl('Definition', [], extractTextChildren(node))];
    case 'normal-definition-first':
      return [mdxJsxEl('DefinitionDescription', [], extractTextAndBoldChildren(node))];
    default:
      console.log('Unhandled node:', node.name);
      return [mdxJsxEl(`Unhandled${node.name.replace('-', '')}`, [], extractTextChildren(node))];
  }
};

const fileContent = await fs.readFile(SOURCE_XML_PATH, 'utf8');
const xmlAst = fromXml(fileContent);
const normalizedXmlAst = flatMap(xmlAst, normalisedXmlAstFn);
const mdRoot = flatMap(normalizedXmlAst, convertToMDXAst);

const components = new Set();
visit(mdRoot, ['mdxJsxFlowElement'], (node) => components.add(node.name));

if (components.size > 0) {
  mdRoot.children.unshift(importEsm('@/components/CustomComponents', [...components]));
}
// Build md content with remark and mdx stringifier extensions
const prettierrcPath = path.join(__dirname, '..', '..', '.prettierrc');
const options = await prettier.resolveConfig(prettierrcPath);
const file = await prettier.format(toMarkdown(mdRoot, {
  listItemIndent: 'one',
  extensions: [mdxToMarkdown({ printWidth: 100 })],
}), { ...options, parser: "mdx" });

await ensureParentDir(OUTPUT_MDX_PATH);
await fs.writeFile(OUTPUT_MDX_PATH, file, 'utf8');
