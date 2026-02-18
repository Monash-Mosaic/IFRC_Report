import { highlight_fields } from './flexsearch-highlight.js';
import { createSearchIndex } from './db.js';
import { routing } from '@/i18n/routing';
const indexCache = new Map();

async function ensureIndex(locale) {
  if (indexCache.has(locale)) {
    return indexCache.get(locale);
  }

  const indexPromise = createSearchIndex(locale, { engine: 'd1' })
    .then((index) => {
      indexCache.set(locale, index);
      return index;
    })
    .catch((error) => {
      indexCache.delete(locale);
      throw error;
    });

  indexCache.set(locale, indexPromise);
  return indexPromise;
}

export async function searchDocuments({ locale, query, limit = 10 }) {
  const safeQuery = query?.trim();
  if (!safeQuery || limit < 1) return [];

  if (!routing.locales.includes(locale)) {
    return [];
  }

  const index = await ensureIndex(locale);

  console.time(`searchCache`);
  const rawResults = await index.searchCacheAsync({
    query: safeQuery,
    field: ['title', 'excerpt'],
    limit,
    enrich: true,
    merge: true,
    // FIXME: This option is not working for SQLite Database
    // highlight: {
    //   template: "<em>$1</em>",
    //   boundary: 500,
    //   merge: true,
    //   clip: false,
    // },
    suggest: true,
    pluck: "excerpt",
  });
  
  const results = highlight_fields(safeQuery, rawResults, index.index, 'excerpt', {
    template: "<em>$1</em>",
    boundary: 500,
    merge: true,
    clip: false,
  });
  console.timeEnd(`searchCache`);

  return results.map((result) => ({
    id: result.doc.id,
    title: `${result.doc.chapterPrefix} > ${result.doc.title}`,
    highlight: result.highlight,
    href: result.doc.href,
  }));
}
