import { createSearchIndex, createFieldEncoder } from './db.js';
import { highlightTitle, highlightExcerpt } from './highlight.js';
import { routing } from '@/i18n/routing';
import { filter as EN_STOPWORDS } from 'flexsearch/lang/en';
import { filter as FR_STOPWORDS } from 'flexsearch/lang/fr';
const indexCache = new Map();

async function ensureIndex(locale) {
  if (indexCache.has(locale)) {
    return indexCache.get(locale);
  }

  const index = await createSearchIndex(locale, { engine: 'd1' });
  indexCache.set(locale, index);
  return index;
}

// FlexSearch only runs its native `context` option (word-proximity scoring) when a field
// is indexed with tokenize:"strict" (see node_modules/flexsearch/src/index.js:96-97 and
// src/index/add.js, where context-map population lives solely in the "strict" branch).
// Our title/excerpt fields use tokenize:"forward" so they also match on partial/prefix
// terms, which silently disables FlexSearch's context feature entirely - increasing
// context.depth/resolution in db.js has no effect. These constants mirror the depth
// values db.js configures (and that FlexSearch itself ignores), reimplemented here as a
// manual re-ranking pass over the already-matched results.
const TITLE_CONTEXT_DEPTH = 1;
const EXCERPT_CONTEXT_DEPTH = 2;

// Matches FlexSearch's own default normalization (NFKD decomposition + stripping combining
// marks - see node_modules/flexsearch/src/encoder.js) so "préjudiciables" and
// "prejudiciables" are treated as the same word for ranking/highlighting, consistent with
// how they're actually indexed and matched. \p{Mn} (Unicode category "Mark, nonspacing")
// covers the same combining-diacritic range FlexSearch strips.
function normalizeWord(word) {
  return word.normalize('NFKD').replace(/\p{Mn}/gu, '').toLowerCase();
}

// 'en' and 'fr' are the only locales in createFieldEncoder() (db.js) that pass a language
// preset (EnglishPreset/FrenchPreset) with a stopword `filter` into the encoder - 'es',
// 'ar', 'ru' and the default case use plain options with no filter, so no stopwords are
// dropped for them either. Query words need the same filtering FlexSearch itself applies,
// or a word like "and" would show up as its own query term and get highlighted/ranked
// even though it was never actually indexed as a searchable term.
function stopwordsForLocale(locale) {
  if (locale === 'en') return EN_STOPWORDS;
  if (locale === 'fr') return FR_STOPWORDS;
  return null;
}

// Acronyms that are also ordinary words cannot be expanded on the document side. The
// encoder lowercases before `prepare` runs (db.js), so by then "WHO" the organization and
// "who" the pronoun are the same string - expanding it injected "world health
// organization" into every "people who fled" sentence in the corpus, which is why those
// entries are deliberately absent from EN_ACRONYMS. "who" is also on FlexSearch's English
// stopword list, so the query encodes to nothing at all and returns zero results.
//
// The query side is the one place the user's capitalization still exists, so the rewrite
// happens here, before the string reaches the encoder: an all-caps token is the acronym,
// and so is a query consisting of nothing else (nobody searches for the bare pronoun).
// Anything else is left alone and keeps behaving like an ordinary word.
const CASED_QUERY_ACRONYMS = {
  en: [
    ['WHO', 'world health organization'],
    ['CAR', 'central african republic'],
  ],
};

function expandCasedAcronyms(locale, query) {
  const rules = CASED_QUERY_ACRONYMS[locale];
  if (!rules) return query;

  return rules.reduce((expanded, [acronym, expansion]) => {
    if (expanded.trim().toUpperCase() === acronym) {
      return `${acronym} ${expansion}`;
    }
    // Case-sensitive on purpose: only the capitalized form is the acronym.
    return expanded.replace(
      new RegExp(`(?<![\\p{L}\\p{N}])${acronym}(?![\\p{L}\\p{N}])`, 'gu'),
      `${acronym} ${expansion}`
    );
  }, query);
}

function tokenizeWords(str, stopwords) {
  const words = (str || '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(normalizeWord);
  return stopwords ? words.filter((word) => !stopwords.has(word)) : words;
}

// Fields are indexed with tokenize:"forward", which matches a query word against any doc
// word it's a prefix of (e.g. "challenge" matches "challenges"). The context-match check
// below has to use the same prefix rule - plain equality would treat "challenge" as a miss
// against "challenges" even though FlexSearch itself still finds and matches that document.
function wordMatches(docWord, queryWord) {
  return docWord.startsWith(queryWord);
}

// Finds the smallest total word-gap across all query-word pairs for a context match
// within `depth` of each other, in doc order - the same "context" semantics FlexSearch's
// own depth option provides, just computed here instead of at index time. Returns null
// when no such match exists, or a smaller number the closer together the words are
// (0 = every word immediately adjacent to the next).
function contextMatchGap(text, queryWords, depth) {
  const words = tokenizeWords(text);

  if (queryWords.length === 1) {
    return words.some((word) => wordMatches(word, queryWords[0])) ? 0 : null;
  }

  let best = null;

  for (let start = 0; start < words.length; start++) {
    if (!wordMatches(words[start], queryWords[0])) continue;

    let pos = start;
    let gap = 0;
    let matched = true;
    for (let q = 1; q < queryWords.length; q++) {
      let found = -1;
      const end = Math.min(pos + depth, words.length - 1);
      for (let x = pos + 1; x <= end; x++) {
        if (wordMatches(words[x], queryWords[q])) {
          found = x;
          break;
        }
      }
      if (found === -1) {
        matched = false;
        break;
      }
      gap += found - pos - 1;
      pos = found;
    }
    if (matched && (best === null || gap < best)) {
      best = gap;
    }
  }

  return best;
}

// Title matches are weighted well above excerpt matches (a heading match is a much
// stronger relevance signal than a body-text match), with a smaller bonus for how close
// together the query words are within each field. The two contributions add up, so a
// document matching in both title and excerpt ranks above a title-only match.
//
// Within each field, a whole-word hit outscores a prefix-only one. tokenize:"forward"
// means a query term also matches any longer word it is a prefix of, which is what lets
// "trust" find "trusted" - but it also means a two-letter query like "AI" matches "aid"
// and "aims", and without this split a section titled "Asks, aims and recommendations"
// collected the full title weight for a query about artificial intelligence. The
// preference is a weighting rather than a filter on purpose: prefix matches are how
// morphology works here now that the stemmer is off, so they must stay eligible.
const TITLE_WEIGHT = 10;
const TITLE_PREFIX_WEIGHT = 4;
const EXCERPT_WEIGHT = 3;
const EXCERPT_PREFIX_WEIGHT = 1;
// A section that says "AI" thirty times is about AI; one that says it once in passing is
// not. Damped so the bonus saturates instead of letting long sections dominate on volume.
const TERM_FREQUENCY_BONUS = 3;
const TERM_FREQUENCY_SATURATION = 4;

function fieldScore(text, queryWords, depth, exactWeight, prefixWeight) {
  const gap = contextMatchGap(text, queryWords, depth);
  if (gap === null) return 0;

  const words = tokenizeWords(text);
  const exactHits = words.filter((word) => queryWords.includes(word)).length;
  const base = (exactHits ? exactWeight : prefixWeight) + (depth - gap);

  return exactHits
    ? base + TERM_FREQUENCY_BONUS * (exactHits / (exactHits + TERM_FREQUENCY_SATURATION))
    : base;
}

function contextScore(doc, queryWords) {
  if (!queryWords.length) return 0;

  return (
    fieldScore(doc.title, queryWords, TITLE_CONTEXT_DEPTH, TITLE_WEIGHT, TITLE_PREFIX_WEIGHT) +
    fieldScore(doc.excerpt, queryWords, EXCERPT_CONTEXT_DEPTH, EXCERPT_WEIGHT, EXCERPT_PREFIX_WEIGHT)
  );
}

// With `suggest: true` FlexSearch also returns documents that match only *some* of the
// query terms, and nothing downstream distinguished those from complete matches - they
// interleaved on context score alone, so a document matching one word out of six could
// outrank one matching all six. Sorting on this first keeps `suggest`'s recall (a query
// whose words never co-occur still returns something) while keeping the top of the page
// for documents that actually contain what was typed.
//
// Coverage has to be measured in *encoder terms*, not raw words. prepareEn/prepareFr
// rewrite acronyms during encoding, so a document whose text only says "ODD" does contain
// the terms for "objectif de developpement durable" even though none of those words
// appear in it. Comparing raw words would score that document 0 and bury it beneath
// documents that merely share one word - the exact documents acronym expansion exists to
// surface.
const encoderCache = new Map();

function encoderForLocale(locale) {
  if (!encoderCache.has(locale)) {
    encoderCache.set(locale, createFieldEncoder(locale));
  }
  return encoderCache.get(locale);
}

const docTermsCache = new Map();

function docTerms(locale, doc) {
  const key = `${locale}:${doc.id}`;
  let terms = docTermsCache.get(key);
  if (!terms) {
    const encoder = encoderForLocale(locale);
    terms = new Set([...encoder.encode(doc.title || ''), ...encoder.encode(doc.excerpt || '')]);
    docTermsCache.set(key, terms);
  }
  return terms;
}

function termCoverage(locale, doc, queryTerms) {
  if (!queryTerms.length) return 1;

  const terms = docTerms(locale, doc);
  const matched = queryTerms.filter((queryTerm) =>
    // tokenize:"forward" - an indexed term is matched by any query term it starts with.
    [...terms].some((term) => term.startsWith(queryTerm))
  ).length;

  return matched / queryTerms.length;
}

export async function searchDocuments({ locale, query, limit = 10 }) {
  const safeQuery = query?.trim();
  if (!safeQuery || limit < 1) return { total: 0, results: [] };

  if (!routing.locales.includes(locale)) {
    return { total: 0, results: [] };
  }

  const index = await ensureIndex(locale);

  // Everything downstream - the search, the ranking and the highlighting - works off the
  // expanded form, so a search for "WHO" both finds and marks up the spelled-out name.
  const expandedQuery = expandCasedAcronyms(locale, safeQuery);

  // Over-fetch beyond the requested limit so the context-match re-rank below can promote
  // a document that FlexSearch's own (context-blind) relevance score ranked lower than `limit`. This work around flexsearch limitation by fetch all the data and limit. MAX docs would be around 337.
  const fetchLimit = limit * 3;

  const rawResults = await index.searchCacheAsync({
    query: expandedQuery,
    field: ['title', 'excerpt'],
    limit: fetchLimit,
    enrich: true,
    merge: true,
    suggest: true,
    // NOTE: do not add `pluck` here - Document.search()'s own `pluck` option silently
    // overrides `field` (see node_modules/flexsearch/src/document/search.js:106), so
    // `pluck: "excerpt"` made this only ever search the excerpt field, never title.
  });
  const totalResults = rawResults.length;
  const queryWords = tokenizeWords(expandedQuery, stopwordsForLocale(locale));
  // `queryWords` drives highlighting and proximity scoring and therefore stays raw (the
  // user's words are what gets marked up); coverage needs the encoded form instead - see
  // termCoverage.
  const queryTerms = encoderForLocale(locale).encode(expandedQuery);
  rawResults.sort(
    (a, b) =>
      termCoverage(locale, b.doc, queryTerms) - termCoverage(locale, a.doc, queryTerms) ||
      contextScore(b.doc, queryWords) - contextScore(a.doc, queryWords)
  );
  const results = rawResults.slice(0, limit);

  return {
    total: totalResults,
    results: results.map((result) => ({
      id: result.doc.id,
      title: `${result.doc.chapterPrefix} > ${result.doc.title}`,
      // Same as `title`, but with matched query terms wrapped in <em> where they occur in
      // the heading - kept separate so JSON-LD/analytics/data-attributes can keep using the
      // plain-text `title` while SearchResultCard renders this one.
      titleHighlight: `${result.doc.chapterPrefix} > ${highlightTitle(result.doc.title, queryWords)}`,
      highlight: highlightExcerpt(result.doc.excerpt, queryWords),
      href: result.doc.href,
    })),
  };
}
