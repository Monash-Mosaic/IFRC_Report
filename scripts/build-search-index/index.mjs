import fs from 'fs/promises';
import { createSearchIndex } from '@/lib/search/db';
import * as report from '@/reports';
import { getPathname } from '@/i18n/navigation';
import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();

/**
 * Generic reducer for Markdown/MDX AST (mdast).
 *
 * @template T
 * @param {object} tree
 * @param {(acc: T, node: any, meta: { parent: any, index: number, depth: number }) => T} transform
 * @param {T} initialValue
 * @returns {T}
 */
function reduceMast(tree, transform, initialValue) {
  if (!tree || typeof tree !== 'object') {
    return initialValue;
  }

  const walk = (node, acc, parent, index, depth) => {
    let next = transform(acc, node, { parent, index, depth });
    const children = Array.isArray(node?.children) ? node.children : [];

    for (let i = 0; i < children.length; i += 1) {
      next = walk(children[i], next, node, i, depth + 1);
    }

    return next;
  };

  return walk(tree, initialValue, null, -1, 0);
}

function extractInlineText(node) {
  const parts = reduceMast(
    node,
    (acc, current) => {
      if (current?.type === 'text' || current?.type === 'inlineCode') {
        const value = typeof current.value === 'string' ? current.value.trim() : '';
        if (value) {
          acc.push(value);
        }
      }
      return acc;
    },
    []
  );

  return parts.join('\n').replace(/\s+/g, ' ').trim();
}

await fs.writeFile('./reports.json', JSON.stringify(report, null, 2));

const { reportUriMap, reportsByLocale } = report;
const locale = 'en';
const reportKey = 'wdr25';
const indices = {
  [locale]: [],
};

for (const [chapterSlug, data] of Object.entries(reportsByLocale[locale].reports[reportKey].chapters)) {
  const { chapterKey, chapterPrefix, chapterNumber } = data['metadata']
  const pathname = getPathname({
    href: {
      pathname: '/reports/[report]/[chapter]',
      params: {
        report: reportUriMap[reportKey].languages[locale],
        chapter: chapterSlug,
      },
    },
    locale,
  });

  slugger.reset();
  const initialValue = [];
  initialValue.push({
    id: `${locale}-${reportKey}-${chapterKey}`,
    depth: 0,
    title: `${chapterPrefix}: ${data.title}`,
    chapterPrefix,
    chapterNumber,
    heading: data.title,
    excerpt: '',
    href: decodeURIComponent(`${pathname}`)b
  });
  const index = reduceMast(
    data.component,
    (acc, node) => {
      if (node?.type === 'heading') {
        const text = extractInlineText(node);
        const id = slugger.slug(text);
        acc.push({
          id: `${locale}-${reportKey}-${chapterKey}-${id}`,
          depth: node.depth ?? 1,
          title: `${chapterPrefix} > ${text}`,
          chapterPrefix,
          chapterNumber,
          heading: text,
          excerpt: '',
          href: decodeURIComponent(`${pathname}#${id}`)
        });
      }
      if (node?.type === 'paragraph' || (node?.type === 'mdxJsxFlowElement' && ['ChapterQuote', 'SideNote', 'SmallQuote', 'Spotlight'].includes(node?.name))) {
        const text = extractInlineText(node);
        const i = acc.length - 1;
        acc[i].excerpt = [acc[i].excerpt, text].join('\n').trimStart('\n');
      }
      return acc;
    },
    initialValue
  );
  indices[locale].push(...index);
}

const searchIndex = await createSearchIndex(locale);
for (const doc of indices[locale]) {
  console.log('Indexing', doc['id'])
  await searchIndex.addAsync(doc);
}

await searchIndex.commit();

await fs.writeFile(
  './index.json',
  JSON.stringify(
    {
      locale,
      reportKey,
      chapters: indices,
    },
    null,
    2
  )
);
