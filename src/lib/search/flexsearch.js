import { highlight_fields } from './flexsearch-highlight.js';
import { createSearchIndex } from './db.js';
import { routing } from '@/i18n/routing';
const indexCache = new Map();

async function ensureIndex(locale) {
  if (indexCache.has(locale)) {
    return indexCache.get(locale);
  }

  const index = await createSearchIndex(locale, { engine: 'd1' });
  indexCache.set(locale, index);
  return index;
}

export async function searchDocuments({ locale, query, limit = 10 }) {
  const safeQuery = query?.trim();
  if (!safeQuery || limit < 1) return [];

  if (!routing.locales.includes(locale)) {
    return [];
  }

  const index = await ensureIndex(locale);

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

  const sortedResults = sortByChapterPrefix(results);

  return sortedResults.map((result) => ({
    id: result.doc.id,
    title: `${result.doc.chapterPrefix} > ${result.doc.title}`,
    highlight: result.highlight,
    href: result.doc.href,
  }));
}

// Sort results by chapterPrefix in the order: Synthesis > Acronyms > Introduction > Chapter > Annex
const sortByChapterPrefix = (results) => {
  return results.sort((a, b) => {
    const prefixA = a.doc.chapterPrefix;
    const prefixB = b.doc.chapterPrefix;

    const orderMap = {
      'Synthesis': 0,
      'Acronyms': 1,
      'Introduction': 2,
    };

    const getSortKey = (prefix) => {
      if (prefix in orderMap) {
        return { priority: orderMap[prefix], number: 0 };
      }

      const chapterMatch = prefix.match(/^Chapter\s+(\d+)$/);
      if (chapterMatch) {
        return { priority: 3, number: parseInt(chapterMatch[1], 10) };
      }

      const annexMatch = prefix.match(/^Annex\s+(\d+)$/);
      if (annexMatch) {
        return { priority: 4, number: parseInt(annexMatch[1], 10) };
      }

      return { priority: 99, number: 0 };
    };

    const sortKeyA = getSortKey(prefixA);
    const sortKeyB = getSortKey(prefixB);

    if (sortKeyA.priority !== sortKeyB.priority) {
      return sortKeyA.priority - sortKeyB.priority;
    }

    return sortKeyA.number - sortKeyB.number;
  });
}