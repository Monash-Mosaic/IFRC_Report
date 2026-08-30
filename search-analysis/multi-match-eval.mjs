/**
 * Multi-word ("multi-match") retrieval evaluation for the WDR25 search feature.
 *
 * Why this exists: the corpus/token analysis (analyze-corpus.mjs) measures what a
 * *single* term encodes to. It says nothing about what happens when a real user types
 * three or six words, which is what most of them actually do:
 *
 *     ~51% of searches are 1-2 words
 *     ~43% of searches are 3-5 words
 *     ~6%  of searches are 6+  words
 *
 * This script builds the REAL document set (same mdast extraction rules as
 * scripts/build-search-index/index.mjs), indexes it with the REAL production encoder
 * config (imported from src/lib/search/db.js - no copy to keep in sync), runs a
 * known-item retrieval benchmark whose query-length mix matches the numbers above, and
 * scores the result ordering with the Google organic click-through curve, so a ranking
 * change is expressed in the only unit that matters: the share of clicks it can capture.
 *
 * Run from repo root:  node search-analysis/multi-match-eval.mjs
 * Output:              search-analysis/data/multi-match-eval.json (+ console summary)
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { mdxjs } from 'micromark-extension-mdxjs';
import { gfm } from 'micromark-extension-gfm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'search-analysis', 'data');
const CORPUS_DIR = path.join(ROOT, 'src', 'reports', 'en', 'wdr25');
const LOCALE = 'en';

// The production index config, imported rather than duplicated. createDocument() only
// touches flexsearch + the language presets, so it loads fine outside the worker.
const { createDocument } = await import(path.join(ROOT, 'src/lib/search/db.js'));
const { filter: EN_STOPWORDS } = await import(
  path.join(ROOT, 'node_modules/flexsearch/dist/module/lang/en.js')
);

// ---------------------------------------------------------------------------
// 1. Document set - same rules as scripts/build-search-index/index.mjs
// ---------------------------------------------------------------------------
const EXCLUDED_HEADINGS = ['endnotes', 'notes de fin'];
const EXCERPT_COMPONENTS = ['ChapterQuote', 'SideNote', 'SmallQuote', 'Spotlight'];

function parseMdx(source) {
  return fromMarkdown(source, {
    extensions: [mdxjs(), gfm()],
    mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown()],
  });
}

function extractInlineText(node) {
  const parts = [];
  const walk = (current) => {
    if (current?.type === 'text' || current?.type === 'inlineCode') {
      const value = typeof current.value === 'string' ? current.value.trim() : '';
      if (value) parts.push(value);
    }
    for (const child of current?.children || []) walk(child);
  };
  walk(node);
  return parts.join('\n').replace(/\s+/g, ' ').trim();
}

// Mirrors the build script's reduceMast(): a heading opens a new document, and every
// following paragraph (or one of the four whitelisted JSX components) appends to the
// most recently opened one. Documents that never receive an excerpt are dropped.
function buildDocuments(file) {
  const source = readFileSync(path.join(CORPUS_DIR, file), 'utf8');
  const chapter = file.replace(/\.mdx$/, '');
  const chapterTitle = source.match(/^export const title\s*=\s*(['"])([\s\S]*?)\1;?\s*$/m)?.[2] || chapter;
  const docs = [
    { id: `${LOCALE}-wdr25-${chapter}`, chapter, title: chapterTitle, excerpt: '' },
  ];

  const walk = (node) => {
    if (node?.type === 'heading') {
      const title = extractInlineText(node);
      docs.push({ id: `${LOCALE}-wdr25-${chapter}-${docs.length}`, chapter, title, excerpt: '' });
    }
    if (
      node?.type === 'paragraph' ||
      (node?.type === 'mdxJsxFlowElement' && EXCERPT_COMPONENTS.includes(node?.name))
    ) {
      const current = docs[docs.length - 1];
      if (!EXCLUDED_HEADINGS.includes(current.title.toLowerCase())) {
        const text = extractInlineText(node).replace(/\[\^\d+\]/g, '');
        current.excerpt = [current.excerpt, text].join('\n').trimStart();
      }
      return; // paragraphs cannot contain headings
    }
    for (const child of node?.children || []) walk(child);
  };

  walk(parseMdx(source));
  return docs.filter((doc) => !!doc.excerpt);
}

const documents = readdirSync(CORPUS_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .sort()
  .flatMap(buildDocuments);

const docsById = new Map(documents.map((doc) => [doc.id, doc]));

// ---------------------------------------------------------------------------
// 2. Ranking logic - ported from src/lib/search/flexsearch.js (keep in sync)
// ---------------------------------------------------------------------------
const TITLE_CONTEXT_DEPTH = 1;
const EXCERPT_CONTEXT_DEPTH = 2;
const TITLE_WEIGHT = 10;
const EXCERPT_WEIGHT = 3;

function normalizeWord(word) {
  return word.normalize('NFKD').replace(/\p{Mn}/gu, '').toLowerCase();
}

function tokenizeWords(str, stopwords) {
  const words = (str || '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(normalizeWord);
  return stopwords ? words.filter((word) => !stopwords.has(word)) : words;
}

function wordMatches(docWord, queryWord) {
  return docWord.startsWith(queryWord);
}

// The production code re-tokenizes the document text on every comparison; the results
// are identical for identical text, so cache them - the benchmark runs this hundreds of
// thousands of times where the app runs it a few dozen.
const wordCache = new Map();
function cachedWords(text) {
  let words = wordCache.get(text);
  if (!words) {
    words = tokenizeWords(text);
    wordCache.set(text, words);
  }
  return words;
}

function contextMatchGap(text, queryWords, depth) {
  const words = cachedWords(text);

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
    if (matched && (best === null || gap < best)) best = gap;
  }
  return best;
}

// The scorer as it stood BEFORE the graded re-rank landed - kept so the benchmark can
// still show the before/after. Production now uses gradedScore (below), which is a port
// of the current contextScore() in flexsearch.js.
function legacyContextScore(doc, queryWords) {
  if (!queryWords.length) return 0;
  let score = 0;
  const titleGap = contextMatchGap(doc.title, queryWords, TITLE_CONTEXT_DEPTH);
  if (titleGap !== null) score += TITLE_WEIGHT + (TITLE_CONTEXT_DEPTH - titleGap);
  const excerptGap = contextMatchGap(doc.excerpt, queryWords, EXCERPT_CONTEXT_DEPTH);
  if (excerptGap !== null) score += EXCERPT_WEIGHT + (EXCERPT_CONTEXT_DEPTH - excerptGap);
  return score;
}

// ---------------------------------------------------------------------------
// 3. Click-through curve
//
// Anchors are the reported Google organic shares: p1 39.8%, p2 18.7%, p3 10.2%
// (68.7% for the top three), p6 4.4% decaying to p10 1.6%. Positions 4-5 and 7-9 are
// not reported, so they are filled by geometric interpolation between the anchors -
// the decay between reported positions is close to constant-ratio, and interpolating
// in log space keeps the curve monotonic without inventing a shape. Everything below
// position 10 is treated as ~0: the search page renders a single un-paginated list, so
// "rank 11" and "rank 30" are equally invisible in practice.
// ---------------------------------------------------------------------------
function geometricFill(curve, from, to) {
  const steps = to - from;
  const ratio = (curve[to] / curve[from]) ** (1 / steps);
  for (let i = from + 1; i < to; i++) {
    curve[i] = Number((curve[i - 1] * ratio).toFixed(2));
  }
}

const CTR = { 1: 39.8, 2: 18.7, 3: 10.2, 6: 4.4, 10: 1.6 };
geometricFill(CTR, 3, 6);
geometricFill(CTR, 6, 10);

function ctrAt(rank) {
  return rank && CTR[rank] ? CTR[rank] : 0;
}

// ---------------------------------------------------------------------------
// 4. Query generation - a known-item benchmark whose length mix matches real traffic
//
// Every query is a verbatim run of words lifted out of one document, so that document
// is by construction a correct answer ("known item"). Other documents may also be
// relevant, which is why the metrics below are about where the KNOWN answer lands, not
// about whether the other results are wrong.
// ---------------------------------------------------------------------------
const BUCKETS = [
  { name: '1-2 words', share: 0.51, lengths: [1, 2] },
  { name: '3-5 words', share: 0.43, lengths: [3, 4, 5] },
  { name: '6+ words', share: 0.06, lengths: [6, 7, 8] },
];

// Deterministic PRNG (mulberry32) so the benchmark is reproducible run to run.
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(20260721);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

function windowFrom(text, length) {
  const words = text.match(WORD_RE) || [];
  if (words.length < length) return null;
  const start = Math.floor(rng() * (words.length - length + 1));
  return words.slice(start, start + length).join(' ');
}

const TOTAL_QUERIES = 1500;

function generateQueries(index) {
  const encoder = index.index.get('title').encoder;
  const queries = [];
  const seen = new Set();

  for (const bucket of BUCKETS) {
    const target = Math.round(TOTAL_QUERIES * bucket.share);
    let guard = 0;
    while (queries.filter((q) => q.bucket === bucket.name).length < target && guard < target * 200) {
      guard++;
      const doc = pick(documents);
      // Titles are short, so long windows can only come from the excerpt. Weighting
      // title queries at ~30% reflects that people do search for section headings.
      const fromTitle = rng() < 0.3;
      const source = fromTitle ? doc.title : doc.excerpt;
      const length = pick(bucket.lengths);
      const text = windowFrom(source, length);
      if (!text) continue;
      const key = `${doc.id}::${text.toLowerCase()}`;
      if (seen.has(key)) continue;
      // A window that encodes to nothing (all stopwords) is not a query a user would
      // ever get results for; drop it rather than scoring a guaranteed failure.
      const encoded = encoder.encode(text);
      if (!encoded.length) continue;
      seen.add(key);
      queries.push({
        bucket: bucket.name,
        words: length,
        field: fromTitle ? 'title' : 'excerpt',
        query: text,
        targetId: doc.id,
        encodedTerms: encoded.length,
        // contextMatchGap() strips stopwords from the query words but NOT from the
        // document text it walks, so a stopword sitting between two content words in the
        // document counts against the depth budget. Flagged here to measure the effect.
        hasStopword: (text.match(WORD_RE) || []).some((w) => EN_STOPWORDS.has(normalizeWord(w))),
      });
    }
  }
  return queries;
}

// ---------------------------------------------------------------------------
// 5. Search variants
// ---------------------------------------------------------------------------
const PAGE_LIMIT = 30; // src/app/[locale]/(site)/search/page.js default `limit`

const VARIANTS = [
  // Production as it now stands: suggest:true, coverage-first, graded score. Mirrors
  // searchDocuments() + contextScore() in src/lib/search/flexsearch.js.
  { key: 'production', label: 'Production (suggest:true + coverage-first + graded score)', suggest: true, rerank: true, coverageFirst: true, graded: true },
  // Production as it stood before the graded re-rank landed.
  { key: 'legacy', label: 'Previous production (context re-rank only)', suggest: true, rerank: true },
  { key: 'suggest-only', label: 'suggest:true, no re-rank', suggest: true, rerank: false },
  { key: 'and-rerank', label: 'suggest:false (AND) + context re-rank', suggest: false, rerank: true },
  { key: 'and-only', label: 'suggest:false (AND), no re-rank', suggest: false, rerank: false },
  // Candidate fix: keep suggest:true (so a query whose words never co-occur still returns
  // something) but sort complete matches above partial ones before applying the existing
  // context score, instead of letting them interleave.
  { key: 'coverage-rerank', label: 'coverage-first + old context score (intermediate step)', suggest: true, rerank: true, coverageFirst: true },
  // Same idea, one step stronger: a document containing the query term as a WHOLE word
  // outranks one that merely starts with it. This is what separates a query for "AI" from
  // every section titled "Asks, aims and recommendations" (see the acronym probes).
  { key: 'exact-first', label: 'suggest:true + exact-term-first, then coverage, then context', suggest: true, rerank: true, coverageFirst: true, exactFirst: true },
];

function runSearch(index, query, variant, pageLimit = PAGE_LIMIT) {
  const raw = index.search({
    query,
    field: ['title', 'excerpt'],
    limit: pageLimit * 3, // flexsearch.js over-fetches before the re-rank
    enrich: true,
    merge: true,
    suggest: variant.suggest,
  });
  const queryWords = tokenizeWords(query, EN_STOPWORDS);
  const queryTerms = new Set(encoderOf(index).encode(query));
  let ordered = raw;
  if (variant.rerank) {
    ordered = [...raw].sort((a, b) => {
      if (variant.exactFirst) {
        // A whole-word title hit beats a prefix-accident title hit, then a document that
        // contains all the terms as whole words beats one that only prefix-matches them.
        const titleDelta =
          titleExactMatch(docsById.get(b.id), encoderOf(index), queryTerms) -
          titleExactMatch(docsById.get(a.id), encoderOf(index), queryTerms);
        if (titleDelta) return titleDelta;
        const delta =
          exactTermCoverage(docsById.get(b.id), encoderOf(index), queryTerms) -
          exactTermCoverage(docsById.get(a.id), encoderOf(index), queryTerms);
        if (delta) return delta;
      }
      if (variant.coverageFirst) {
        const delta =
          termCoverage(docsById.get(b.id), encoderOf(index), queryTerms) -
          termCoverage(docsById.get(a.id), encoderOf(index), queryTerms);
        if (delta) return delta;
      }
      if (variant.graded) {
        return gradedScore(b.doc, queryWords) - gradedScore(a.doc, queryWords);
      }
      return legacyContextScore(b.doc, queryWords) - legacyContextScore(a.doc, queryWords);
    });
  }
  return { ordered: ordered.slice(0, pageLimit), total: raw.length, queryWords, queryTerms };
}

function encoderOf(index) {
  return index.index.get('title').encoder;
}

// How many of the query's encoded terms a document actually contains. With suggest:true
// FlexSearch returns partial matches too, so this is what separates "matched everything
// the user asked for" from "matched one word out of six".
const docTermCache = new Map();
function docTermsFor(doc, encoder) {
  let terms = docTermCache.get(doc.id);
  if (!terms) {
    terms = new Set([...encoder.encode(doc.title), ...encoder.encode(doc.excerpt)]);
    docTermCache.set(doc.id, terms);
  }
  return terms;
}

// Share of the query's terms the document contains as WHOLE terms. tokenize:'forward'
// makes a query term match anything it prefixes, so a 2-letter query like "ai" also hits
// "aid"/"aim"/"aims"; this separates "the document is about AI" from "the document
// contains a word that happens to start with those two letters".
// Share of the query's terms the document contains at all - counting a term as present
// when any indexed term starts with it, which is what tokenize:'forward' does. This is
// the port of termCoverage() in src/lib/search/flexsearch.js (keep in sync); it is
// measured in encoder terms rather than raw words so that acronym expansion counts: a
// document whose text only says "ODD" does contain the terms for "objectif de
// developpement durable".
function termCoverage(doc, encoder, queryTerms) {
  if (!queryTerms.size) return 1;
  const docTerms = docTermsFor(doc, encoder);
  let hit = 0;
  for (const term of queryTerms) {
    for (const docTerm of docTerms) {
      if (docTerm.startsWith(term)) {
        hit++;
        break;
      }
    }
  }
  return hit / queryTerms.size;
}

function exactTermCoverage(doc, encoder, queryTerms) {
  if (!queryTerms.size) return 1;
  const docTerms = docTermsFor(doc, encoder);
  let hit = 0;
  for (const term of queryTerms) if (docTerms.has(term)) hit++;
  return hit / queryTerms.size;
}

// Titles carry 10x the weight of excerpts in contextScore(), and that weight is awarded
// for a PREFIX hit - which is how a section called "Asks, aims and recommendations"
// collects a full title score for the query "AI". This asks the narrower question: does
// the title contain a query term as a whole word?
const titleTermCache = new Map();
function titleTermsFor(doc, encoder) {
  let terms = titleTermCache.get(doc.id);
  if (!terms) {
    terms = new Set(encoder.encode(doc.title));
    titleTermCache.set(doc.id, terms);
  }
  return terms;
}

function titleExactMatch(doc, encoder, queryTerms) {
  const titleTerms = titleTermsFor(doc, encoder);
  for (const term of queryTerms) if (titleTerms.has(term)) return 1;
  return 0;
}


// Port of the CURRENT contextScore() in src/lib/search/flexsearch.js (keep in sync).
// Same structure as the legacy scorer - title beats excerpt, closer beats further - but a
// whole-word hit outscores a prefix accident, and repeated mentions outscore a single
// passing one. Both are bonuses rather than gates, which is what keeps prefix matching
// (the thing carrying morphology now that the stemmer is off) eligible; the `exact-first`
// variant below shows what happens when the same preference is made a hard sort key.
const TITLE_PREFIX_WEIGHT = 4;
const EXCERPT_PREFIX_WEIGHT = 1;
const TERM_FREQUENCY_BONUS = 3;
const TERM_FREQUENCY_SATURATION = 4;

function fieldScore(text, queryWords, depth, exactWeight, prefixWeight) {
  const gap = contextMatchGap(text, queryWords, depth);
  if (gap === null) return 0;

  const words = cachedWords(text);
  const exactHits = words.filter((word) => queryWords.includes(word)).length;
  const base = (exactHits ? exactWeight : prefixWeight) + (depth - gap);

  return exactHits
    ? base + TERM_FREQUENCY_BONUS * (exactHits / (exactHits + TERM_FREQUENCY_SATURATION))
    : base;
}

function gradedScore(doc, queryWords) {
  if (!queryWords.length) return 0;
  return (
    fieldScore(doc.title, queryWords, TITLE_CONTEXT_DEPTH, TITLE_WEIGHT, TITLE_PREFIX_WEIGHT) +
    fieldScore(doc.excerpt, queryWords, EXCERPT_CONTEXT_DEPTH, EXCERPT_WEIGHT, EXCERPT_PREFIX_WEIGHT)
  );
}

// ---------------------------------------------------------------------------
// 6. Run
// ---------------------------------------------------------------------------
const index = createDocument(LOCALE);
for (const doc of documents) index.add(doc.id, doc);

const encoder = index.index.get('title').encoder;
const queries = generateQueries(index);

function summarize(rows) {
  const n = rows.length;
  const sum = (fn) => rows.reduce((acc, row) => acc + fn(row), 0);
  const ranks = rows.map((row) => row.rank).filter((rank) => rank !== null);
  ranks.sort((a, b) => a - b);
  return {
    queries: n,
    zeroResultRate: sum((r) => (r.total === 0 ? 1 : 0)) / n,
    medianResults: n ? rows.map((r) => r.total).sort((a, b) => a - b)[Math.floor(n / 2)] : 0,
    foundRate: ranks.length / n,
    top1: sum((r) => (r.rank === 1 ? 1 : 0)) / n,
    top3: sum((r) => (r.rank !== null && r.rank <= 3 ? 1 : 0)) / n,
    top10: sum((r) => (r.rank !== null && r.rank <= 10 ? 1 : 0)) / n,
    medianRank: ranks.length ? ranks[Math.floor(ranks.length / 2)] : null,
    mrr: sum((r) => (r.rank ? 1 / r.rank : 0)) / n,
    // Expected share of clicks the correct document captures, given where it landed.
    // 39.8 is the ceiling (every known item ranked first).
    ctrCapture: sum((r) => ctrAt(r.rank)) / n,
    tiedTop10: sum((r) => (r.tiedTop10 ? 1 : 0)) / n,
    // How much of the top-3 click mass (68.7%) is spent on documents that do not
    // contain every term the user typed - the cost of suggest:true.
    dilutedTop3: sum((r) => r.dilutedTop3) / n,
    rerankEngaged: sum((r) => (r.rerankEngaged ? 1 : 0)) / n,
    // Split the same measure by whether the query contains a stopword. The two numbers
    // should be similar; a gap means the depth budget is being spent on words the query
    // side already threw away.
    rerankEngagedWithStopword: rate(rows.filter((r) => r.hasStopword), (r) => r.rerankEngaged),
    rerankEngagedNoStopword: rate(rows.filter((r) => !r.hasStopword), (r) => r.rerankEngaged),
    ctrCaptureWithStopword: mean(rows.filter((r) => r.hasStopword), (r) => ctrAt(r.rank)),
    ctrCaptureNoStopword: mean(rows.filter((r) => !r.hasStopword), (r) => ctrAt(r.rank)),
  };
}

function rate(rows, fn) {
  return rows.length ? rows.filter(fn).length / rows.length : null;
}

function mean(rows, fn) {
  return rows.length ? rows.reduce((acc, row) => acc + fn(row), 0) / rows.length : null;
}

const results = {};
const perBucket = {};

for (const variant of VARIANTS) {
  const rows = queries.map((q) => {
    const { ordered, total, queryWords, queryTerms } = runSearch(index, q.query, variant);
    const position = ordered.findIndex((r) => r.id === q.targetId);
    const top3 = ordered.slice(0, 3);
    const partial = top3.filter((r) => termCoverage(docsById.get(r.id), encoder, queryTerms) < 1);
    const top10Scores = ordered.slice(0, 10).map((r) => legacyContextScore(r.doc, queryWords));
    return {
      ...q,
      rank: position === -1 ? null : position + 1,
      total,
      dilutedTop3: top3.length ? partial.length / top3.length : 0,
      // The re-rank only reorders when some document actually scores above zero -
      // i.e. when the query words appear close enough together to satisfy the depth.
      rerankEngaged: ordered.some((r) => legacyContextScore(r.doc, queryWords) > 0),
      // Sorting is stable, so documents sharing a score keep FlexSearch's arbitrary
      // (insertion-derived) order. When the whole first page collapses onto one or two
      // distinct scores, the ordering the user sees is effectively unranked.
      tiedTop10: top10Scores.length > 1 && new Set(top10Scores).size <= 2,
    };
  });

  results[variant.key] = { label: variant.label, overall: summarize(rows) };
  perBucket[variant.key] = Object.fromEntries(
    BUCKETS.map((bucket) => [bucket.name, summarize(rows.filter((r) => r.bucket === bucket.name))])
  );

  // Traffic-weighted headline: each bucket's CTR capture weighted by its real share of
  // searches (51 / 43 / 6), so one number reflects the query mix users actually type.
  results[variant.key].weightedCtrCapture = BUCKETS.reduce(
    (acc, bucket) => acc + bucket.share * perBucket[variant.key][bucket.name].ctrCapture,
    0
  );
  results[variant.key].byBucket = perBucket[variant.key];
}

// ---------------------------------------------------------------------------
// 6b. Page-depth curve - "would a longer results page fix this?"
//
// Re-runs the production ranking with the page limit opened all the way to the corpus,
// then reports, per bucket, how deep the page must go before the known answer is on it
// at all (recall) and what that depth is worth in clicks. The two curves diverge hard:
// recall keeps climbing with depth, clicks do not, because the CTR curve is ~0 past
// position 10. Depth buys findability; only rank buys clicks.
// ---------------------------------------------------------------------------
const DEPTH_PROBES = [3, 5, 10, 20, 30, 50, 100, 200, documents.length];

function depthCurves() {
  const out = {};
  for (const bucket of BUCKETS) {
    const ranks = queries
      .filter((q) => q.bucket === bucket.name)
      .map((q) => {
        const { ordered } = runSearch(index, q.query, VARIANTS[0], documents.length);
        const position = ordered.findIndex((r) => r.id === q.targetId);
        return position === -1 ? null : position + 1;
      });
    const n = ranks.length;
    out[bucket.name] = {
      queries: n,
      // Smallest page size at which 90% of queries have the known answer somewhere on
      // the page - swept over every depth, not just the probe grid. null = never, within
      // the whole corpus.
      depthFor90pctRecall:
        [...Array(documents.length).keys()]
          .map((i) => i + 1)
          .find((d) => ranks.filter((r) => r !== null && r <= d).length / n >= 0.9) ?? null,
      byDepth: DEPTH_PROBES.map((depth) => ({
        depth,
        recall: ranks.filter((r) => r !== null && r <= depth).length / n,
        // Clicks are capped by the CTR curve, so this stops growing after depth 10.
        ctrCapture:
          ranks.reduce((acc, r) => acc + (r !== null && r <= depth ? ctrAt(r) : 0), 0) / n,
      })),
    };
  }
  return out;
}

const depth = depthCurves();

// ---------------------------------------------------------------------------
// 7. Cross-document queries - the case the known-item benchmark cannot see
//
// Every query above is lifted verbatim from one document, so an AND search can never
// come up empty: the answer exists by construction. Real multi-word queries are not
// quotes, they are combinations ("trust misinformation volunteers") whose words are
// spread across the corpus. These queries splice words from two different documents to
// measure the one thing suggest:true exists for - not returning an empty page.
// ---------------------------------------------------------------------------
function generateCrossQueries(count) {
  const out = [];
  let guard = 0;
  while (out.length < count && guard < count * 200) {
    guard++;
    const bucket = rng() < 0.43 / 0.49 ? BUCKETS[1] : BUCKETS[2]; // multi-word buckets only
    const length = pick(bucket.lengths);
    const left = Math.max(1, Math.floor(length / 2));
    const docA = pick(documents);
    const docB = pick(documents);
    if (docA.id === docB.id) continue;
    const a = windowFrom(rng() < 0.3 ? docA.title : docA.excerpt, left);
    const b = windowFrom(rng() < 0.3 ? docB.title : docB.excerpt, length - left);
    if (!a || !b) continue;
    const query = `${a} ${b}`;
    if (!encoder.encode(query).length) continue;
    out.push({ bucket: bucket.name, words: length, query });
  }
  return out;
}

const crossQueries = generateCrossQueries(400);
const crossResults = {};
for (const variant of VARIANTS) {
  const rows = crossQueries.map((q) => {
    const { ordered, total, queryTerms } = runSearch(index, q.query, variant);
    const top3 = ordered.slice(0, 3);
    const coverages = top3.map((r) => termCoverage(docsById.get(r.id), encoder, queryTerms));
    return {
      ...q,
      total,
      // Mean share of the user's terms present in the documents they are most likely to
      // click (the top three absorb 68.7% of clicks).
      top3Coverage: coverages.length ? coverages.reduce((x, y) => x + y, 0) / coverages.length : 0,
    };
  });
  const n = rows.length;
  crossResults[variant.key] = {
    label: variant.label,
    queries: n,
    zeroResultRate: rows.filter((r) => r.total === 0).length / n,
    medianResults: rows.map((r) => r.total).sort((a, b) => a - b)[Math.floor(n / 2)],
    meanTop3Coverage: rows.reduce((acc, r) => acc + r.top3Coverage, 0) / n,
  };
}

// ---------------------------------------------------------------------------
// 8. Acronym reachability
//
// en no longer expands acronyms (db.js prepareEn has the call commented out), so an
// acronym and its spelled-out name are unrelated token sets. This counts, per acronym,
// how many DOCUMENTS are reachable only by the short form, only by the long form, or by
// both — i.e. the size of the gap the expansion used to bridge. Mirrors EN_ACRONYMS in
// src/lib/search/db.js (keep in sync; db.js does not export it).
// ---------------------------------------------------------------------------
const EN_ACRONYMS = [
  ['ai', 'artificial intelligence'], ['car', 'central african republic'],
  ['cbs', 'community-based surveillance'],
  ['cdac', 'communicating with disaster affected communities'],
  ['cea', 'community engagement and accountability'],
  ['cred', 'centre for research on the epidemiology of disasters'],
  ['cso', 'civil society organization'], ['drc', 'democratic republic of the congo'],
  ['dref', 'disaster response emergency fund'], ['drm', 'disaster risk management'],
  ['icrc', 'international committee of the red cross'],
  ['ict', 'information and communication technology'],
  ['idmc', 'internal displacement monitoring centre'],
  ['ifrc', 'international federation of red cross and red crescent societies'],
  ['itu', 'international telecommunication union'],
  ['mdh', 'misinformation, disinformation and hate speech'],
  ['mhpss', 'mental health and psychosocial support'],
  ['ngo', 'non-governmental organization'],
  ['ocha', 'office for the coordination of humanitarian affairs'],
  ['oecd', 'organisation for economic co-operation and development'],
  ['q&a', 'questions and answers'],
  ['rcce', 'risk communication and community engagement'],
  ['sdg', 'sustainable development goal'], ['undp', 'un development programme'],
  ['unhcr', 'un high commissioner for refugees'], ['who', 'world health organization'],
];

// Documents whose indexed terms contain the term sequence `terms` in order and adjacent —
// the same thing a phrase-shaped query has to find.
function docsContainingSequence(terms) {
  if (!terms.length) return null;
  const hits = new Set();
  for (const doc of documents) {
    const stream = [...encoder.encode(doc.title), ...encoder.encode(doc.excerpt)];
    for (let i = 0; i + terms.length <= stream.length; i++) {
      let ok = true;
      for (let t = 0; t < terms.length; t++) {
        if (stream[i + t] !== terms[t]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        hits.add(doc.id);
        break;
      }
    }
  }
  return hits;
}

const acronymCoverage = EN_ACRONYMS.map(([acronym, expansion]) => {
  const acrTerms = encoder.encode(acronym);
  const expTerms = encoder.encode(expansion);
  if (!acrTerms.length || !expTerms.length) {
    return { acronym: acronym.toUpperCase(), unsearchable: true, acronymOnly: null, expansionOnly: null, both: null };
  }
  const acrDocs = docsContainingSequence(acrTerms);
  const expDocs = docsContainingSequence(expTerms);
  let acronymOnly = 0;
  let expansionOnly = 0;
  let both = 0;
  for (const id of new Set([...acrDocs, ...expDocs])) {
    if (acrDocs.has(id) && expDocs.has(id)) both++;
    else if (acrDocs.has(id)) acronymOnly++;
    else expansionOnly++;
  }
  return { acronym: acronym.toUpperCase(), unsearchable: false, acronymOnly, expansionOnly, both };
});

// ---------------------------------------------------------------------------
// 8b. Acronym query probes - what a user typing "AI" actually gets
//
// Short acronyms collide head-on with tokenize:'forward': a 2-letter query term matches
// every indexed term it prefixes, so "ai" reaches "aid", "aim", "aims", "aimed"... In a
// humanitarian corpus that is not a rare edge case, it is the dominant reading of those
// two letters. These probes run the queries through the production path and classify
// every hit as an exact-term match or a prefix-only accident, then re-run them under the
// exact-first candidate to show what a tie-break would do.
// ---------------------------------------------------------------------------
const ACRONYM_PROBE_QUERIES = [
  'AI', 'AI-generated', 'artificial intelligence', 'AI generated content',
  'IFRC', 'CEA', 'WHO', 'World Health Organization', 'Q&A',
];

function classifyResults(ordered, queryTerms) {
  return ordered.map((r) => {
    const doc = docsById.get(r.id);
    const docTerms = docTermsFor(doc, encoder);
    const titleTerms = titleTermsFor(doc, encoder);
    const titleHitsPrefix = [...queryTerms].some((t) =>
      [...titleTerms].some((d) => d.startsWith(t))
    );
    return {
      title: doc.title,
      // Every query term present as a whole word: the document really is about this.
      exact: [...queryTerms].every((t) => docTerms.has(t)),
      // The title - worth 10x an excerpt hit - contains a query term as a whole word.
      titleExact: [...queryTerms].some((t) => titleTerms.has(t)),
      // ...or the title only earned that weight by starting with the query term.
      titlePrefixAccident: titleHitsPrefix && ![...queryTerms].some((t) => titleTerms.has(t)),
      // The longer words a query term reached by prefix rather than by being one.
      prefixOnly: [...queryTerms]
        .filter((t) => !docTerms.has(t))
        .flatMap((t) => [...docTerms].filter((d) => d.startsWith(t)))
        .slice(0, 3),
      titlePrefixVia: [...queryTerms]
        .filter((t) => !titleTerms.has(t))
        .flatMap((t) => [...titleTerms].filter((d) => d.startsWith(t)))
        .slice(0, 3),
    };
  });
}

const acronymProbes = ACRONYM_PROBE_QUERIES.map((query) => {
  const queryTerms = new Set(encoder.encode(query));
  const byKey = (key) => VARIANTS.find((v) => v.key === key);
  const prod = runSearch(index, query, VARIANTS[0]);
  const fixed = runSearch(index, query, byKey('exact-first'));
  const legacyRun = runSearch(index, query, byKey('legacy'));
  const prodRows = classifyResults(prod.ordered, queryTerms);
  const fixedRows = classifyResults(fixed.ordered, queryTerms);
  const legacyRows = classifyResults(legacyRun.ordered, queryTerms);
  const share = (rows, n, key) =>
    rows.slice(0, n).length
      ? rows.slice(0, n).filter((r) => r[key]).length / Math.min(n, rows.length)
      : 0;
  const summarizeRows = (rows) => ({
    exactShareTop3: share(rows, 3, 'exact'),
    exactShareTop10: share(rows, 10, 'exact'),
    // The measure that matters for what the user sees at the top: is the strong title
    // signal real, or did the title just happen to start with those letters?
    titleAccidentTop3: share(rows, 3, 'titlePrefixAccident'),
    titleAccidentTop10: share(rows, 10, 'titlePrefixAccident'),
    exactCount: rows.filter((r) => r.exact).length,
    top5: rows.slice(0, 5),
  });
  return {
    query,
    encodedTerms: [...queryTerms],
    results: prod.total,
    // A query that encodes to nothing can never match anything (e.g. "WHO").
    unsearchable: queryTerms.size === 0,
    production: summarizeRows(prodRows),
    exactFirst: summarizeRows(fixedRows),
    legacy: summarizeRows(legacyRows),
  };
});

// The corpus side of the same story: which indexed terms share a prefix with "ai", and
// how much of the corpus they account for. Counted both ways - occurrences (how often the
// encoder emits the term) and documents (how many sections contain it).
function prefixNeighbours(prefix) {
  const occurrences = new Map();
  const docCounts = new Map();
  for (const doc of documents) {
    const terms = [...encoder.encode(doc.title), ...encoder.encode(doc.excerpt)];
    const seenHere = new Set();
    for (const term of terms) {
      if (!term.startsWith(prefix)) continue;
      occurrences.set(term, (occurrences.get(term) || 0) + 1);
      if (!seenHere.has(term)) {
        seenHere.add(term);
        docCounts.set(term, (docCounts.get(term) || 0) + 1);
      }
    }
  }
  return [...occurrences.entries()]
    .map(([term, count]) => ({ term, occurrences: count, documents: docCounts.get(term) }))
    .sort((a, b) => b.occurrences - a.occurrences);
}

const aiPrefixNeighbours = prefixNeighbours('ai');

// Worked examples for the notebook: multi-word queries where production ranking loses
// the known answer out of the click zone.
const examples = [];
for (const q of queries.filter((row) => row.words >= 3).slice(0, 400)) {
  const prod = runSearch(index, q.query, VARIANTS[0]);
  const rank = prod.ordered.findIndex((r) => r.id === q.targetId);
  if (rank === -1 || rank + 1 > 3) {
    examples.push({
      query: q.query,
      words: q.words,
      field: q.field,
      
      targetTitle: docsById.get(q.targetId).title,
      rank: rank === -1 ? null : rank + 1,
      results: prod.total,
      top3: prod.ordered.slice(0, 3).map((r) => r.doc.title),
    });
  }
  if (examples.length >= 25) break;
}

const output = {
  generatedAt: new Date().toISOString(),
  locale: LOCALE,
  documents: documents.length,
  queries: queries.length,
  pageLimit: PAGE_LIMIT,
  ctrCurve: CTR,
  buckets: BUCKETS.map((b) => ({ name: b.name, share: b.share, lengths: b.lengths })),
  queryMix: Object.fromEntries(
    BUCKETS.map((b) => [b.name, queries.filter((q) => q.bucket === b.name).length])
  ),
  variants: results,
  crossDocument: { queries: crossQueries.length, variants: crossResults },
  depth,
  acronymCoverage,
  acronymProbes,
  aiPrefixNeighbours,
  examples,
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(path.join(DATA_DIR, 'multi-match-eval.json'), JSON.stringify(output, null, 2));

const pct = (v) => `${(v * 100).toFixed(1)}%`;
console.log(`documents=${documents.length} queries=${queries.length}\n`);
console.log('CTR curve:', CTR);
for (const variant of VARIANTS) {
  const r = results[variant.key];
  console.log(`\n== ${variant.label}`);
  console.log(`   weighted CTR capture: ${r.weightedCtrCapture.toFixed(2)} / 39.80`);
  for (const bucket of BUCKETS) {
    const b = r.byBucket[bucket.name];
    console.log(
      `   ${bucket.name.padEnd(10)} top1=${pct(b.top1)} top3=${pct(b.top3)} top10=${pct(b.top10)} ` +
        `found=${pct(b.foundRate)} mrr=${b.mrr.toFixed(3)} ctr=${b.ctrCapture.toFixed(2)} ` +
        `diluted3=${pct(b.dilutedTop3)} tied=${pct(b.tiedTop10)} rerank=${pct(b.rerankEngaged)}`
    );
  }
  if (variant.key === 'production') {
    for (const bucket of BUCKETS) {
      const d = depth[bucket.name];
      console.log(
        `   depth ${bucket.name.padEnd(10)} ` +
          d.byDepth
            .filter((x) => [3, 10, 30, 100, documents.length].includes(x.depth))
            .map((x) => `@${x.depth}: recall=${pct(x.recall)} ctr=${x.ctrCapture.toFixed(1)}`)
            .join('  ') +
          `  | 90% recall at depth ${d.depthFor90pctRecall ?? 'never'}`
      );
    }
  }
  const cross = crossResults[variant.key];
  console.log(
    `   cross-doc queries: zero-result=${pct(cross.zeroResultRate)} ` +
      `median results=${cross.medianResults} top3 term coverage=${pct(cross.meanTop3Coverage)}`
  );
}
console.log('\n== Acronym query probes (previous ranking -> current production)');
for (const probe of acronymProbes) {
  console.log(
    `   ${JSON.stringify(probe.query).padEnd(28)} enc=${JSON.stringify(probe.encodedTerms).padEnd(34)} ` +
      `results=${String(probe.results).padStart(3)} ` +
      `exact@10 ${pct(probe.legacy.exactShareTop10)} -> ${pct(probe.production.exactShareTop10)}  ` +
      `title-accident@3 ${pct(probe.legacy.titleAccidentTop3)} -> ${pct(probe.production.titleAccidentTop3)}  ` +
      `@10 ${pct(probe.legacy.titleAccidentTop10)} -> ${pct(probe.production.titleAccidentTop10)}`
  );
}

console.log(`\nWrote ${path.join(DATA_DIR, 'multi-match-eval.json')}`);
