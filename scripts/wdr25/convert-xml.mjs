import fs from 'fs/promises';
import path from 'path';
import { fromXml } from 'xast-util-from-xml';
import { visit } from 'unist-util-visit';
import flatMap from 'unist-util-flatmap';
import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxToMarkdown } from 'mdast-util-mdx';
import { paragraph, text, heading, list, listItem, image, strong, emphasis } from 'mdast-builder';
import { toJs } from 'estree-util-to-js';
import { parseArgs } from 'node:util';
import * as prettier from 'prettier';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

console.log(__dirname);
const DEFAULTS = {
  sourceDir: path.join(__dirname, 'data'),
  outputDir: path.join(__dirname, 'output'),
  source: 'WDR26-Executive-Summary-EN.xml',
  mdx: 'WDR26-Executive-Summary-EN.mdx',
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

const supportExtractChildren = ['text', 'strong', 'emphasis'];
const currentLocale = 'en';
const chapterIndex = 1;
let insightIndex = 0;
let figIndex = 0;

const tagMap = {
  'p1.3': '{TypologyOfHarm.Physical}',
  'p3.19': '{TypologyOfHarm.Psychological}',
  'p1.28': '{TypologyOfHarm.Social}',
  'p1.17': '{TypologyOfHarm.Societal}',
  'p3.17': '{TypologyOfHarm.Informational}',
  'p1.20': '{TypologyOfHarm.Deprivational}',
  'p3.25': '{TypologyOfHarm.Digital}',
};

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

// section: box and contributor wrapping

const contributorTagNames = new Set([
  'h1-c1',
  'h2-c1',
  'h3-c1',
  'h1-c2',
  'h2-c2',
  'h3-c2',
  'h1-span',
  'h2-span',
  'h3-span',
  'h1-3c-c1',
  'h2-3c-c1',
  'h3-3c-c1',
  'h1-3c-c2',
  'h2-3c-c2',
  'h3-3c-c2',
  'h1-3c-c3',
  'h2-3c-c3',
  'h3-3c-c3',
]);

const isElement = (node) => node?.type === 'element';
const isText = (node) => node?.type === 'text';
const isWhitespaceText = (node) => isText(node) && /^[\s\r\n\t]*$/.test(node.value ?? '');

const isContributorNode = (node) =>
  isElement(node) &&
  (contributorTagNames.has(node.name) || node.name === 'contributor' || node.name === 'contributor-tag');
const isBoxTagName = (name) => typeof name === 'string' && name.includes('-box');

const isAllowedBeforeContributors = (node) => {
  if (!node) return false;
  if (isWhitespaceText(node)) return true;
  if (!isElement(node)) return false;
  if (node.name === 'box') return false;
  if (isBoxTagName(node.name)) return true;
  if (node.name === 'bullet-list-group') return true;
  if (node.name === 'anchor') return true;
  if (node.name === 'contributor-tag') return true;
  if (node.name === 'contributor') return true;
  return false;
};

const isAllowedAfterContributors = (node) => {
  if (!node) return false;
  if (isWhitespaceText(node)) return true;
  return isContributorNode(node);
};

const wrapBoxRuns = (node) => {
  if (!node || !Array.isArray(node.children)) return;
  if (isElement(node) && node.name === 'box') return;

  const children = node.children;
  const out = [];

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];

    if (isElement(child) && child.name === 'toh-box') {
      const group = [child];
      let j = i + 1;
      let seenContributor = false;

      while (j < children.length) {
        const next = children[j];

        if (!seenContributor) {
          if (isContributorNode(next)) {
            seenContributor = true;
            group.push(next);
            j += 1;
            continue;
          }
          if (isAllowedBeforeContributors(next)) {
            group.push(next);
            j += 1;
            continue;
          }
          break;
        }

        if (isAllowedAfterContributors(next)) {
          group.push(next);
          j += 1;
          continue;
        }
        break;
      }

      if (!seenContributor) {
        out.push(child);
        continue;
      }

      out.push({
        type: 'element',
        name: 'box',
        attributes: {},
        children: group,
      });

      i = j - 1;
      continue;
    }

    if (isElement(child) && Array.isArray(child.children)) {
      wrapBoxRuns(child);
    }

    out.push(child);
  }

  node.children = out;
};

const nextNonWhitespaceIndex = (nodes, startIndex) => {
  for (let i = startIndex; i < nodes.length; i += 1) {
    const current = nodes[i];
    if (!isWhitespaceText(current)) {
      return i;
    }
  }
  return -1;
};

const getContributorKey = (name) => {
  if (typeof name !== 'string') return null;
  if (name.includes('-3c-')) {
    const match = name.match(/-3c-(c\d)$/);
    return match ? match[1] : name;
  }
  const match = name.match(/-(c\d|span)$/);
  return match ? match[1] : name;
};

const wrapContributorGroups = (node) => {
  if (!node || !Array.isArray(node.children)) return;

  const children = node.children;
  const out = [];

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];

    if (isElement(child) && child.name === 'contributor-tag') {
      out.push(child);
      continue;
    }

    if (isContributorNode(child)) {
      const contributors = [];
      let currentGroup = null;
      let currentKey = null;
      let j = i;

      const flushGroup = () => {
        if (!currentGroup) return;
        contributors.push({
          type: 'element',
          name: 'contributor',
          attributes: {},
          children: currentGroup,
        });
        currentGroup = null;
        currentKey = null;
      };

      while (j < children.length) {
        const current = children[j];

        if (isContributorNode(current)) {
          const key = getContributorKey(current.name);
          if (!currentGroup || key !== currentKey) {
            flushGroup();
            currentGroup = [];
            currentKey = key;
          }
          currentGroup.push(current);
          j += 1;
          continue;
        }

        if (isWhitespaceText(current)) {
          const nextIndex = nextNonWhitespaceIndex(children, j + 1);
          if (nextIndex !== -1 && isContributorNode(children[nextIndex])) {
            if (currentGroup) {
              currentGroup.push(current);
            }
            j += 1;
            continue;
          }
        }

        break;
      }

      flushGroup();

      out.push({
        type: 'element',
        name: 'contributor-tag',
        attributes: {},
        children: contributors,
      });

      i = j - 1;
      continue;
    }

    if (isElement(child) && Array.isArray(child.children)) {
      wrapContributorGroups(child);
    }

    out.push(child);
  }

  node.children = out;
};

// section: end

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
  (node.children || [])
    .filter((child) => supportExtractChildren.includes(child?.type))
    .map(normaliseChildrenText);

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
 * Add whitespace padding between children of paragraph's type
 * @param {import('unist').Node & { children?: import('unist').Node[] }} tree
 * @returns {void}
 */
const addPaddingParagraphChildren = (tree) => {
  visit(tree, 'paragraph', (paragraphNode) => {
    if (!paragraphNode.children || paragraphNode.children.length <= 1) {
      return;
    }

    const newChildren = [];

    paragraphNode.children.forEach((child, index) => {
      newChildren.push(child);

      if (index < paragraphNode.children.length - 1) {
        newChildren.push({
          type: 'text',
          value: ' ',
        });
      }
    });

    paragraphNode.children = newChildren;
  });
};

const mapTagToENum = (code) => {
  if (tagMap[code]) {
    return tagMap[code];
  } else {
    console.warn(`Warning: No mapping found for code: ${code}`);
    return `{Unknown}`;
  }
};

const mapTOHIcons = (tree) => {
  visit(tree, 'mdxJsxFlowElement', (insightNode) => {
    if (insightNode.name != 'TohInsight') {
      return;
    }

    if (insightNode.children.length > 0) {
      let enumChildren = [];
      const iconsCode = insightNode.children[0].value.split(' ');
      iconsCode.forEach((code, index) => {
        enumChildren.push(mapTagToENum(code));
      });

      insightNode.children[0].value = enumChildren.join();
    }
  });
};

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
    case 'anchor':
      figIndex += 1;
      return [mdxJsxEl('Anchor', [
        { name: 'meta', value: `Fig ${chapterIndex}.${figIndex}` }
      ], extractTextChildren(node))];
    case 'caption':
      return [mdxJsxEl('Caption', [], extractTextChildren(node))];
    case 'box':
      insightIndex += 1;
      const tohIndex = node.children.findIndex((n => n.type === 'mdxJsxFlowElement' && n.name === 'TohInsight'));
      const toh = node.children.splice(tohIndex, 1);
      const tohAttr = toh[0]?.attributes.find(attr => attr.name === 'types');
      return [mdxJsxEl('Box', [
            { name: 'index', value: `${chapterIndex}.${insightIndex}` },
            tohAttr
          ], node.children)];
    case 'h1-box':
    case 'h1-spotlight':
      return [heading(2, extractTextChildren(node))];
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
    case 'normal-expanded':
    case 'normal-tight':
    case 'normal-10':
      return [paragraph(extractTextChildren(node))];
    case 'normal-2c':
      return [mdxJsxEl('ReccomendationsTitle', [], extractTextChildren(node))];
    case 'recommendations':
      return [mdxJsxEl('Reccomendations', [], extractTextChildren(node))];
    case 'bold':
      return [strong(extractTextChildren(node))];
    case 'sup':
    case 'regular-italic':
      return [emphasis(extractTextChildren(node))];
    case 'numbered-list':
      return [listItem(extractTextChildren(node))];
    case 'numbered-list-group':
      return [list('ordered', node.children)];
    case 'contributor-tag':
      return [mdxJsxEl('ContributorTag', [], node.children)];
    case 'contributor':
      return [mdxJsxEl('Contributor', [], node.children)];
    case 'h1-c1':
    case 'h1-c2':
    case 'h1-span':
    case 'h1-3c-c1':
    case 'h1-3c-c2':
    case 'h1-3c-c3':
      return [mdxJsxEl('ContributorName', [], extractTextChildren(node))];
    case 'h2-c1':
    case 'h2-c2':
    case 'h2-span':
    case 'h2-3c-c1':
    case 'h2-3c-c2':
    case 'h2-3c-c3':
      return [mdxJsxEl('ContributorEntity', [], node.children)];
    case 'h3-c1':
    case 'h3-c2':
    case 'h3-span':
    case 'h3-3c-c3':
      return [mdxJsxEl('ContributorRole', [], extractTextChildren(node))];
    case 'h1-contributor-spotlight':
      return [mdxJsxEl('H1Contributor', [], extractTextChildren(node))];
    case 'contributor-name-spotlight':
      return [mdxJsxEl('ContributorName', [], extractTextChildren(node))];
    case 'contributor-position-spotlight':
      return [mdxJsxEl('ContributorPosition', [], extractTextChildren(node))];
    case 'bullet-list-2c':
    case 'bullet-list':
    case 'normal-box-bullet-list':
    case 'normal-spotlight-bullet-list':
      return [listItem(extractTextChildren(node))];
    case 'bullet-list-group':
      return [list('unordered', node.children)];
    case 'contributor-role':
      return [mdxJsxEl('ContributorRole', [], extractTextChildren(node))];
    case 'h1-contributor':
      return [mdxJsxEl('H1Contributor', [], extractTextChildren(node))];
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
    case 'quote':
    case 'small-quote':
      return [mdxJsxEl('SmallQuote', [], extractTextChildren(node))];
    case 'small-quote-author':
      return [mdxJsxEl('SmallQuoteAuthor', [], extractTextChildren(node))];
    case 'h1-sidenote-context':
      return [mdxJsxEl('SidenoteContext', [], extractTextChildren(node))];
    case 'sidenotes-contributions-first':
      return [mdxJsxEl('SidenotesContributionsFirst', [], extractTextChildren(node))];
    case 'sidenote':
      return [mdxJsxEl('SideNote', [], node.children)];
    case 't1-definition':
      return [mdxJsxEl('Definition', [], extractTextChildren(node))];
    case 'normal-definition-first':
      return [mdxJsxEl('DefinitionDescription', [], extractTextChildren(node))];
    case 'toh-body':
    case 'toh-box':
      const tohInsightTypesAttr = { 
        type: "mdxJsxAttribute",
        name: 'types',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: `[${(extractTextChildren(node)[0]?.value || '')
            .split(' ')
            .filter(e => e)
            .map(mapTagToENum)
            .map(e => e.replace(/{|}/g, '')).join(', ')}]`,
        }
      };
      return [
        mdxJsxEl('TohInsight', [tohInsightTypesAttr], []),
      ];
    default:
      console.log('Unhandled node:', node.name);
      return [];
  }
};

const fileContent = await fs.readFile(SOURCE_XML_PATH, 'utf8');

const xmlAst = fromXml(fileContent);

wrapContributorGroups(xmlAst);
wrapBoxRuns(xmlAst);

const normalizedXmlAst = flatMap(xmlAst, normalisedXmlAstFn);
// console.log(normalizedXmlAst.children[1].children);

const mdRoot = flatMap(normalizedXmlAst, convertToMDXAst);

const components = new Set();
visit(mdRoot, ['mdxJsxFlowElement'], (node) => components.add(node.name));

addPaddingParagraphChildren(mdRoot);

mapTOHIcons(mdRoot);

mdRoot.children.unshift(importEsm('@/types/TypologyOfHarm', ['TypologyOfHarm']));
if (components.size > 0) {
  const importNames = Array.from(components).sort();
  mdRoot.children.unshift(importEsm('@/components/CustomComponents', importNames));
}

// Build md content with remark and mdx stringifier extensions
const prettierrcPath = path.join(__dirname, '..', '..', '.prettierrc');
const options = await prettier.resolveConfig(prettierrcPath);

const joinInlineChildren = (left, right, parent, state) => {
  if (left.type == 'text' && right.type == 'strong') {
    return 0;
  }
  if (left.type == 'strong' && right.type == 'text') {
    return 0;
  }
};

// Create the array
export const joinFunctions = [joinInlineChildren];

const prePrett = toMarkdown(mdRoot, {
  listItemIndent: 'one',
  emphasis: '*',
  join: joinFunctions,
  tightDefinitions: true,
  extensions: [mdxToMarkdown({ printWidth: 100 })],
});

const file = await prettier.format(prePrett, { ...options, parser: 'mdx' });

await ensureParentDir(OUTPUT_MDX_PATH);
await fs.writeFile(OUTPUT_MDX_PATH, file, 'utf8');
