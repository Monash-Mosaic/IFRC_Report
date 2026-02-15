import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// English stop words - common words to filter out from search indexing
const STOP_WORDS_EN = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'the',
  'this',
  'but',
  'they',
  'have',
  'had',
  'what',
  'when',
  'where',
  'who',
  'which',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'can',
  'just',
  'should',
  'now',
  'also',
  'or',
  'if',
  'then',
  'been',
  'being',
  'would',
  'could',
  'their',
  'there',
  'these',
  'those',
  'we',
  'our',
  'us',
  'i',
  'you',
  'your',
  'my',
  'me',
  'him',
  'her',
  'she',
  'them',
  'any',
  'about',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'again',
  'further',
  'once',
]);

// Database path - stored in data folder
const DB_PATH = path.join(process.cwd(), 'data', 'search.db');

// Cache the database connection in a module-level variable
let cachedDb = null;

/**
 * Get database instance - use cached connection
 * @returns {Database.Database}
 */
function getDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error('[Search] Database not found');
    throw new Error('Search database not found. Run: pnpm build:search');
  }

  cachedDb = new Database(DB_PATH, { readonly: true });
  return cachedDb;
}

/**
 * Search documents using FTS5
 * @param {Object} params
 * @param {string} params.locale - Language locale (e.g., 'en', 'fr')
 * @param {string} params.query - Search query string
 * @param {number} params.limit - Maximum number of results
 * @returns {Promise<Array<{id: string, title: string, highlight: string, href: string}>>}
 */
export async function searchDocuments({ locale, query, limit = 20 }) {
  const safeQuery = query?.trim();
  if (!safeQuery) return [];

  try {
    const db = getDatabase();

    // Prepare the FTS5 query - use * for prefix matching (without quotes)
    // This allows "harm" to match "harmful", "harmony", etc.
    const ftsQuery = safeQuery
      .split(/\s+/)
      .filter((word) => word.length > 1 && !STOP_WORDS_EN.has(word.toLowerCase()))
      .map((word) => `${word.replace(/[^\w]/g, '')}*`)
      .join(' OR ');

    if (!ftsQuery) return [];

    // Search with FTS5 using snippet() for highlighting
    // bm25() with weights: title (10.0) has higher weight than content (1.0)
    const results = db
      .prepare(
        `
      SELECT 
        d.id,
        d.title,
        d.href,
        d.locale,
        snippet(search_fts, 1, '<em>', '</em>', '...', 50) as highlight
      FROM search_fts
      JOIN documents d ON search_fts.rowid = d.rowid
      WHERE search_fts MATCH ?
        AND d.locale = ?
      ORDER BY bm25(search_fts, 10.0, 1.0)
      LIMIT ?
    `
      )
      .all(ftsQuery, locale, limit);

    return results.map((row) => ({
      id: row.id,
      title: row.title,
      highlight: row.highlight || '',
      href: row.href,
    }));
  } catch (error) {
    console.error('[Search] Error occurred during search');
    return [];
  }
}
