import { Document, Charset, Encoder, Resolver } from 'flexsearch';
import { createSearchIndex } from './db';

const indexCache = new Map();

/** @returns {Promise<Document>} */
async function ensureIndex(locale) {
  if (indexCache.has(locale)) {
    return indexCache.get(locale);
  }

  const index = await createSearchIndex(locale);

  indexCache.set(locale, index);
  return index;
}

await ensureIndex('en');

export async function searchDocuments({ locale, query, limit = 10 }) {
  const safeQuery = query?.trim();
  if (!safeQuery) return [];
  
  // TODO: Making this function faster would improve overall search performance
  console.time(`ensureIndex for ${locale}`);
  const index = await ensureIndex(locale);
  console.timeEnd(`ensureIndex for ${locale}`);

  console.time(`searchCache for ${safeQuery}`);
  const rawResults = await index.searchCacheAsync({
    query: safeQuery,
    limit,
    enrich: true,
    merge: true,
    highlight: {
      template: "<em>$1</em>",
      boundary: 500,
      merge: true,
      clip: false,
    },
    suggest: true,
    pluck: "excerpt",
  });
  console.timeEnd(`searchCache for ${safeQuery}`);

  return rawResults.map((result) => ({
    id: result.doc.id,
    title: result.doc.title,
    highlight: result.doc.excerpt,
    href: result.doc.href,
  }));
}
