import { createSearchIndex } from '@/lib/search/db';
import * as report from '@/reports';
import { getPathname } from '@/i18n/navigation';
import GithubSlugger from 'github-slugger';
import dotenv from 'dotenv';
import { getPlatformProxy } from 'wrangler';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const slugger = new GithubSlugger();
const projectRoot = pathResolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const dotenvResult = dotenv.config({ path: pathResolve(projectRoot, '.env') });

if (dotenvResult.error && dotenvResult.error.code !== 'ENOENT') {
  throw dotenvResult.error;
}

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

const { reportsByLocale } = report;
const indices = Object.fromEntries(Object.keys(reportsByLocale).map(e => [e, []]));
const configuredEnvironment = process.env.CLOUDFLARE_ENV || 'preview';
const cloudflareEnvironment =
  configuredEnvironment === 'production' ? undefined : configuredEnvironment;
const searchIndexNamespace = process.env.NEXT_PUBLIC_GIT_TAG?.trim() || '';

async function createPlatformProxy() {
  return getPlatformProxy({
    envFiles: [pathResolve(projectRoot, '.env')],
    environment: cloudflareEnvironment,
    configPath: pathResolve(projectRoot, 'wrangler.jsonc'),
    persist: true,
  });
}

console.info(
  `[build-search-index] environment=${cloudflareEnvironment || 'production'} namespace=${searchIndexNamespace || 'default'}`
);
const platform = await createPlatformProxy();
const { env, dispose } = platform;

try {
  if (!env?.SEARCH_DB) {
    throw new Error('SEARCH_DB binding is required. Configure D1 in wrangler.jsonc.');
  }

  for (const [locale, { reports }] of Object.entries(reportsByLocale)) {
    slugger.reset();
    for (const [report, { chapters }] of Object.entries(reports)) {
      for (const [chapter, content] of Object.entries(chapters)) {
        const { chapterPrefix } = content['metadata']
        const pathname = getPathname({
          href: {
            pathname: '/reports/[report]/[chapter]',
            params: {
              report: report,
              chapter: chapter,
            },
          },
          locale,
        });
      
        const initialValue = [];
        initialValue.push({
          id: `${locale}-${report}-${chapter}`,
          chapterPrefix,
          title: content.title,
          excerpt: '',
          href: decodeURIComponent(`${pathname}`),
        });
        const documents = reduceMast(
          content.component,
          (acc, node) => {
            if (node?.type === 'heading') {
              const text = extractInlineText(node);
              const id = slugger.slug(text);
              acc.push({
                id: `${locale}-${report}-${chapter}-${id}`,
                chapterPrefix,
                title: text,
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
        ).filter(e => !!e.excerpt);
        indices[locale].push(...documents);
      }
    }
    console.log(`[build-search-index] locale=${locale} documents=${indices[locale].length}`);
    const searchIndex = await createSearchIndex(locale, {
      db: env.SEARCH_DB.withSession(`first-primary`),
      namespace: searchIndexNamespace,
    });
    await searchIndex.clear();
    for (const doc of indices[locale]) {
      await searchIndex.addAsync(doc['id'], doc);
    }
    await searchIndex.commit();

    const table = searchIndex?.db?.tableName?.('reg');
    if (!table) {
      throw new Error(`[build-search-index] Unable to resolve registry table for locale ${locale}`);
    }
    const countResult = await env.SEARCH_DB
      .prepare(`SELECT COUNT(*) AS count FROM ${table}`)
      .first();
    const persistedCount = Number(countResult?.count || 0);

    console.info(
      `[build-search-index] locale=${locale} indexed=${indices[locale].length} persisted=${persistedCount}`
    );

    if (indices[locale].length > 0 && persistedCount < 1) {
      throw new Error(
        `[build-search-index] No persisted rows found in ${table} for locale ${locale}`
      );
    }
  }
} finally {
  await dispose();
}
