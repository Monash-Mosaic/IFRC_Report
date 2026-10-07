/**
 * Corpus + token analysis for the WDR25 search feature.
 *
 * Reads the MDX corpus per locale (src/reports/<locale>/wdr25), tokenizes it,
 * and empirically probes the exact FlexSearch encoder configuration used by
 * src/lib/search/db.js to quantify how "fuzzy" matching currently is.
 *
 * Run from repo root:  node search-analysis/analyze-corpus.mjs
 * Output:              search-analysis/data/corpus-stats.json (+ console summary)
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { Document, Charset, Encoder } = await import(
  path.join(ROOT, 'node_modules/flexsearch/dist/flexsearch.bundle.module.min.mjs')
);
const EnglishPreset = (await import(path.join(ROOT, 'node_modules/flexsearch/dist/module/lang/en.js'))).default;
const FrenchPreset = (await import(path.join(ROOT, 'node_modules/flexsearch/dist/module/lang/fr.js'))).default;
const { filter: EN_STOPWORDS } = await import(path.join(ROOT, 'node_modules/flexsearch/dist/module/lang/en.js'));
const { filter: FR_STOPWORDS } = await import(path.join(ROOT, 'node_modules/flexsearch/dist/module/lang/fr.js'));

const LOCALES = ['en', 'fr', 'es', 'zh', 'ar', 'ru'];

// ---------------------------------------------------------------------------
// Encoder config
//
// The CURRENT config is imported from src/lib/search/db.js rather than copied, so this
// analysis can never drift from what the app actually indexes with. createDocument()
// only touches flexsearch + the language presets, so it loads fine outside the worker;
// the per-field encoder is read back off the built Document.
//
// The PREVIOUS config (soundex charsets, en/fr acronym expansion on the en side) has no
// source of truth left in the tree, so it stays duplicated here as a historical record
// for the before/after collision numbers.
// ---------------------------------------------------------------------------
const { createDocument } = await import(path.join(ROOT, 'src/lib/search/db.js'));

function createFieldEncoder(locale) {
  return createDocument(locale).index.get('title').encoder;
}

// Acronym expansion as it was written when the en encoder still ran it (it is now
// disabled for en in db.js — see prepareEn there — and survives only for fr).
function prepareEnOld(str) {
  return str
    .replace(/\[\^[0-9]+\]/g, "")
    .replace(/\bai\b/g, "artificial intelligence")
    .replace(/\bcar\b/g, "central african republic")
    .replace(/\bcbs\b/g, "community-based surveillance")
    .replace(/\bcdac\b/g, "communicating with disaster affected communities")
    .replace(/\bcea\b/g, "community engagement and accountability")
    .replace(/\bcred\b/g, "centre for research on the epidemiology of disasters")
    .replace(/\bcso\b/g, "civil society organization")
    .replace(/\bdrc\b/g, "democratic republic of the congo")
    .replace(/\bdref\b/g, "disaster response emergency fund")
    .replace(/\bdrm\b/g, "disaster risk management")
    .replace(/\bicrc\b/g, "international committee of the red cross")
    .replace(/\bict\b/g, "information and communication technology")
    .replace(/\bidmc\b/g, "internal displacement monitoring centre")
    .replace(/\bifrc\b/g, "international federation of red cross and red crescent societies")
    .replace(/\bitu\b/g, "international telecommunication union")
    .replace(/\bmdh\b/g, "misinformation, disinformation and hate speech")
    .replace(/\bmhpss\b/g, "mental health and psychosocial support")
    .replace(/\bngo\b/g, "non-governmental organization")
    .replace(/\bocha\b/g, "office for the coordination of humanitarian affairs (UN)")
    .replace(/\boecd\b/g, "organisation for economic co-operation and development")
    .replace(/\bq&a\b/g, "questions and answers")
    .replace(/\brcce\b/g, "risk communication and community engagement")
    .replace(/\bsdg\b/g, "sustainable development goal")
    .replace(/\bundp\b/g, "un development programme")
    .replace(/\bunhcr\b/g, "un high commissioner for refugees")
    .replace(/\bwho\b/g, "world health organization");
}

// PREVIOUS config — soundex phonetic charsets (LatinAdvanced/Balance), for before/after comparison
function createFieldEncoderOld(locale) {
  switch (locale) {
    case 'en': return new Encoder(Charset.LatinAdvanced, EnglishPreset, { prepare: prepareEnOld, stemmer: false });
    case 'fr': return new Encoder(Charset.LatinBalance, FrenchPreset);
    case 'es': return new Encoder(Charset.LatinBalance);
    case 'zh': return new Encoder(Charset.CJK);
    case 'ar': return new Encoder(Charset.Normalize, { rtl: true });
    case 'ru':
    default:   return new Encoder(Charset.Normalize);
  }
}

// The probes below index a handful of hand-written documents with the production field
// config — same tokenize/context/encoder settings, just in memory instead of D1.
function createInMemoryDocument(locale) {
  return createDocument(locale);
}

// ---------------------------------------------------------------------------
// Drop the endnotes/references section (citation footnotes).
//
// In every locale the footnote definitions ([^N]: ...) sit under a final
// heading ("Endnotes"/"Notes de fin"/"Referencias"/"尾注"/…) and run to EOF.
// We cut from that heading onward, keyed off the first footnote definition so
// no heading name has to be hardcoded. Excluded from the corpus analysis per
// README Q13 (they are 7.6% of the EN corpus and mostly citation/URL noise).
// ---------------------------------------------------------------------------
function stripEndnotes(source) {
  const firstFootnote = source.match(/^\[\^[0-9]+\]:/m);
  if (!firstFootnote) return source;
  let cut = firstFootnote.index;
  const before = source.slice(0, cut);
  const headingRe = /^#{1,6}\s+.*$/gm;
  let m;
  let lastHeadingIdx = -1;
  while ((m = headingRe.exec(before)) !== null) lastHeadingIdx = m.index;
  if (lastHeadingIdx !== -1) cut = lastHeadingIdx;
  return source.slice(0, cut);
}

// ---------------------------------------------------------------------------
// MDX -> plain text (approximation of scripts/build-search-index extraction)
// ---------------------------------------------------------------------------
function stripMdx(source) {
  let text = stripEndnotes(source);
  const headings = [];

  // import blocks
  text = text.replace(/^import[\s\S]*?from\s+['"][^'"]*['"];?/gm, '');
  // export const title/subtitle = '...'
  text = text.replace(/^export const (title|subtitle)\s*=\s*(['"])([\s\S]*?)\2;?\s*$/gm, (_, _k, _q, v) => {
    headings.push(v);
    return '';
  });
  // multi-line export objects/arrays, other export lines
  text = text.replace(/^export const \w+\s*=\s*\{[\s\S]*?^\};?/gm, '');
  text = text.replace(/^export const \w+\s*=\s*\[[\s\S]*?^\];?/gm, '');
  text = text.replace(/^export .*$/gm, '');
  // code fences
  text = text.replace(/```[\s\S]*?```/g, '');
  // markdown images / links -> keep label
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1');
  // footnote refs + definitions
  text = text.replace(/\[\^[0-9]+\]:?/g, '');
  // markdown headings -> collect + keep text
  text = text.replace(/^#{1,6}\s+(.*)$/gm, (_, h) => {
    headings.push(h.trim());
    return h;
  });
  // JSX expressions and tags (loop for nesting / multi-line attributes)
  for (let i = 0; i < 8; i += 1) text = text.replace(/\{[^{}]*\}/gs, ' ');
  for (let i = 0; i < 8; i += 1) text = text.replace(/<\/?[A-Za-z][^<>]*?>/gs, ' ');
  // leftover markdown decoration
  text = text.replace(/^>\s?/gm, '');
  text = text.replace(/[*_~`|]+/g, ' ');
  text = text.replace(/^-{3,}\s*$/gm, ' ');
  return { text: text.replace(/[ \t]+/g, ' ').trim(), headings };
}

// ---------------------------------------------------------------------------
// Tokenization for statistics (script-aware, NOT the flexsearch encoder)
// ---------------------------------------------------------------------------
const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
const HAN_RE = /\p{Script=Han}/gu;

function stripDiacritics(str) {
  return str.normalize('NFKD').replace(/[̀-ًͯ-ٰٟ]/g, '');
}

const EXTRA_STOPWORDS = {
  es: new Set(['de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'es', 'son', 'ser', 'fue', 'han', 'ha', 'pueden', 'puede']),
  ru: new Set(['и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а', 'по', 'это', 'она', 'этот', 'к', 'но', 'они', 'мы', 'как', 'из', 'у', 'который', 'то', 'за', 'свой', 'весь', 'год', 'от', 'так', 'о', 'для', 'ты', 'же', 'все', 'тот', 'мочь', 'вы', 'человек', 'такой', 'его', 'сказать', 'только', 'или', 'ещё', 'еще', 'бы', 'себя', 'один', 'когда', 'уже', 'до', 'время', 'если', 'сам', 'чтобы', 'при', 'их', 'более', 'также', 'этом', 'является', 'может', 'были', 'было', 'том', 'мере', 'могут', 'между', 'через']),
  ar: new Set(['في', 'من', 'على', 'أن', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'أو', 'لا', 'ما', 'كما', 'بين', 'عبر', 'وقد', 'حيث', 'ذلك', 'قد', 'كان', 'كانت', 'تكون', 'يكون', 'إن', 'و', 'ثم', 'لم', 'لكن', 'هو', 'هي', 'كل', 'بعض', 'غير', 'بعد', 'قبل', 'عند', 'حول', 'خلال', 'حتى', 'إذا', 'فإن', 'وفي', 'ومن', 'وما', 'مما', 'منها', 'فيها', 'بها', 'لها', 'إليها', 'عليها', 'وهذا', 'وهي', 'وهو', 'أي', 'أكثر', 'مثل', 'دون']),
  zh: new Set(['的', '和', '在', '与', '了', '是', '或', '这', '们', '为', '中', '对', '有', '而', '以', '不', '于', '其', '也', '并', '被', '将', '到', '等', '更', '但', '一', '个', '上', '下', '所', '如', '之', '这些', '可能', '我们', '他们']),
};

function topN(counter, n) {
  return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function count(iterable, counter = new Map()) {
  for (const item of iterable) counter.set(item, (counter.get(item) || 0) + 1);
  return counter;
}

// ---------------------------------------------------------------------------
// Per-locale analysis
// ---------------------------------------------------------------------------
const results = {};

for (const locale of LOCALES) {
  const dir = path.join(ROOT, 'src', 'reports', locale, 'wdr25');
  const files = readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort();

  let fullText = '';
  const allHeadings = [];
  for (const file of files) {
    const { text, headings } = stripMdx(readFileSync(path.join(dir, file), 'utf8'));
    fullText += `\n${text}`;
    allHeadings.push(...headings);
  }

  const rawTokens = fullText.match(WORD_RE) || [];
  const lowerTokens = rawTokens.map((t) => t.toLowerCase());
  const freq = count(lowerTokens);

  // acronym-like tokens (all caps, >= 2 chars) counted on the original casing
  const acronyms = count(rawTokens.filter((t) => /^[A-Z][A-Z0-9&]+$/.test(t) && t.length >= 2));

  const stopwords =
    locale === 'en' ? EN_STOPWORDS :
    locale === 'fr' ? FR_STOPWORDS :
    EXTRA_STOPWORDS[locale] || new Set();
  const contentFreq = new Map([...freq].filter(([t]) => !stopwords.has(t) && !stopwords.has(stripDiacritics(t)) && !/^\d+$/.test(t)));

  const stats = {
    files,
    headingCount: allHeadings.length,
    sampleHeadings: allHeadings.slice(0, 12),
    totalTokens: lowerTokens.length,
    uniqueTokens: freq.size,
    typeTokenRatio: +(freq.size / Math.max(1, lowerTokens.length)).toFixed(3),
    hyphenatedTokens: new Set(lowerTokens.filter((t) => t.includes('-'))).size,
    apostropheTokens: new Set(lowerTokens.filter((t) => /['’]/.test(t))).size,
    diacriticTokens: new Set(lowerTokens.filter((t) => stripDiacritics(t) !== t)).size,
    numericTokens: new Set(lowerTokens.filter((t) => /^\d/.test(t))).size,
    topTokensRaw: topN(freq, 25),
    topContentTokens: topN(contentFreq, 30),
    topAcronyms: topN(acronyms, 20),
  };

  // Chinese: char-level view (matches Charset.CJK split:'' behavior)
  if (locale === 'zh') {
    const hanChars = fullText.match(HAN_RE) || [];
    const hanFreq = count(hanChars);
    const bigrams = new Map();
    for (const run of fullText.match(/\p{Script=Han}+/gu) || []) {
      for (let i = 0; i < run.length - 1; i += 1) {
        const bg = run.slice(i, i + 2);
        bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
      }
    }
    const latinTokens = count((fullText.match(/[A-Za-z][A-Za-z'’\-]*/g) || []).map((t) => t.toLowerCase()));
    stats.zh = {
      hanChars: hanChars.length,
      uniqueHanChars: hanFreq.size,
      topHanBigrams: topN(bigrams, 25).filter(([bg]) => !EXTRA_STOPWORDS.zh.has(bg[0]) && !EXTRA_STOPWORDS.zh.has(bg[1])),
      embeddedLatinTokens: topN(latinTokens, 15),
      embeddedLatinTokenTotal: [...latinTokens.values()].reduce((a, b) => a + b, 0),
    };
  }

  // Arabic: definite-article prevalence (ال prefix means bare-stem queries can miss)
  if (locale === 'ar') {
    const alTokens = lowerTokens.filter((t) => t.startsWith('ال') && t.length > 3);
    stats.ar = {
      tokensWithDefiniteArticle: alTokens.length,
      shareWithDefiniteArticle: +(alTokens.length / Math.max(1, lowerTokens.length)).toFixed(3),
    };
  }

  // -------------------------------------------------------------------------
  // Encoder collision analysis: distinct surface forms that an encoder maps
  // onto the same index term ("how fuzzy is fuzzy?"). We report three:
  //   currentEncoder    — the NEW db.js config (soundex dropped)
  //   previousEncoder   — the OLD soundex config, for before/after comparison
  //   normalizeBaseline — plain Charset.Normalize (lowercase + NFKD only)
  // -------------------------------------------------------------------------
  if (locale !== 'zh') {
    const currentEncoder = createFieldEncoder(locale);
    const previousEncoder = createFieldEncoderOld(locale);
    const baselineEncoder = new Encoder(Charset.Normalize);

    const collide = (encoder) => {
      const groups = new Map();
      for (const [token, n] of freq) {
        let encoded;
        try {
          encoded = encoder.encode(token);
        } catch {
          continue;
        }
        if (!encoded || encoded.length === 0) continue;
        const key = encoded.join('+');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push([token, n]);
      }
      // keep only groups where >1 surface form differs beyond case/diacritics
      const nontrivial = [...groups.entries()].filter(([, members]) => {
        const canon = new Set(members.map(([t]) => stripDiacritics(t)));
        return canon.size > 1;
      });
      return {
        groupCount: nontrivial.length,
        collidingTokenCount: nontrivial.reduce((a, [, m]) => a + m.length, 0),
        examples: nontrivial
          .map(([key, members]) => ({ encodedAs: key, members: members.sort((a, b) => b[1] - a[1]) }))
          .sort((a, b) => b.members.reduce((x, [, n]) => x + n, 0) - a.members.reduce((x, [, n]) => x + n, 0))
          .slice(0, 25),
      };
    };

    stats.collisions = {
      currentEncoder: collide(currentEncoder),
      previousEncoder: collide(previousEncoder),
      normalizeBaseline: collide(baselineEncoder),
    };

    if (locale === 'en') {
      // Acronym expansion is disabled for en (db.js prepareEn), which is what killed the
      // "who" pronoun bug — prepare sees lowercased text, so it could never tell the
      // pronoun from the organization. The flip side is that these tokens now carry no
      // cross-form matching at all: this is the corpus population that used to be
      // expanded, i.e. the size of the acronym gap the change opened up.
      const preparePatterns = ['ai', 'car', 'cbs', 'cdac', 'cea', 'cred', 'cso', 'drc', 'dref', 'drm', 'icrc', 'ict', 'idmc', 'ifrc', 'itu', 'mdh', 'mhpss', 'ngo', 'ocha', 'oecd', 'rcce', 'sdg', 'undp', 'unhcr', 'who'];
      const caseSensitive = count(rawTokens.filter((t) => preparePatterns.includes(t.toLowerCase())));
      stats.prepareRewrites = topN(caseSensitive, 30);

      // Ground truth for the Python encoder port in en_search_analysis.py: every unique
      // corpus token, encoded by the real FlexSearch under all three configs.
      const enTokenEncodings = {
        note:
          'Ground-truth encodings from flexsearch 0.8.212 for every unique lowercased EN corpus token ' +
          '(endnotes removed). current = live db.js en config (Charset.Normalize, acronym expansion OFF); ' +
          'previous = OLD soundex config (LatinAdvanced, acronym expansion ON); baseline = plain Charset.Normalize.',
        current: {},
        previous: {},
        baseline: {},
      };
      for (const token of freq.keys()) {
        enTokenEncodings.current[token] = currentEncoder.encode(token);
        enTokenEncodings.previous[token] = previousEncoder.encode(token);
        enTokenEncodings.baseline[token] = baselineEncoder.encode(token);
      }
      mkdirSync(path.join(ROOT, 'search-analysis', 'data'), { recursive: true });
      writeFileSync(
        path.join(ROOT, 'search-analysis', 'data', 'en-token-encodings.json'),
        JSON.stringify(enTokenEncodings)
      );
      console.log(`[en] wrote ground-truth encodings for ${freq.size} unique tokens`);
    }
  }

  results[locale] = stats;
  console.log(`[${locale}] files=${files.length} tokens=${stats.totalTokens} unique=${stats.uniqueTokens} headings=${stats.headingCount}` +
    (stats.collisions ? ` collisionGroups(current)=${stats.collisions.currentEncoder.groupCount} (previous)=${stats.collisions.previousEncoder.groupCount} (baseline)=${stats.collisions.normalizeBaseline.groupCount}` : ''));
}

// ---------------------------------------------------------------------------
// Behavioral probes: tiny in-memory indexes using the EXACT field config,
// exercised with realistic queries (typos, inflections, articles, acronyms).
// ---------------------------------------------------------------------------
async function probe(locale, docs, queries) {
  const doc = createInMemoryDocument(locale);
  for (const d of docs) doc.add(d.id, d);
  const outcomes = [];
  for (const q of queries) {
    // suggest:true mirrors src/lib/search/flexsearch.js — a query no longer has to match
    // every term, so a probe can now match on a subset of what was typed.
    const res = doc.search({ query: q.query, field: ['title', 'excerpt'], limit: 10, merge: true, suggest: true });
    const ids = res.map((r) => r.id);
    outcomes.push({ ...q, matchedIds: ids });
  }
  return outcomes;
}

const probes = {};

probes.en = await probe('en', [
  { id: 'pronoun', title: 'Displacement', excerpt: 'people who fled their homes need support' },
  { id: 'who-org', title: 'Health partners', excerpt: 'the World Health Organization published guidance' },
  { id: 'trusted', title: 'Community', excerpt: 'trusted local volunteers share information' },
  { id: 'government', title: 'Institutions', excerpt: 'government agencies and public institutions' },
], [
  { label: 'FIXED — "world health organization" no longer drags in the relative-pronoun doc', query: 'world health organization', expect: 'who-org only' },
  { label: 'NEW GAP — query "WHO" (the acronym) now matches NOTHING: expansion is off and "who" is a stopword', query: 'WHO', expect: 'who-org (currently empty)' },
  { label: 'forward tokenize: partial word "trust" matches "trusted"', query: 'trust', expect: 'trusted' },
  { label: 'FIXED — typo "goverment" should NOT match (soundex dropped)', query: 'goverment', expect: 'no match' },
  { label: 'FIXED — typo "govirnmend" should NOT match (soundex dropped)', query: 'govirnmend', expect: 'no match' },
  { label: 'suggest:true — a query where only some terms match still returns the partial hits', query: 'trusted volunteers earthquake', expect: 'trusted (partial match)' },
]);

probes.fr = await probe('fr', [
  { id: 'sante', title: 'Santé mentale', excerpt: 'la santé mentale et le soutien psychosocial' },
  { id: 'confiance', title: 'Confiance', excerpt: 'la confiance dans les institutions humanitaires' },
], [
  { label: 'diacritics-insensitive: "sante"', query: 'sante', expect: 'sante' },
  { label: 'inflection: "confiances" (plural) — stemmer is now OFF, so this rides on forward-prefix only', query: 'confiances', expect: '(no match — prefix goes the other way)' },
  { label: 'FIXED — phonetic typo "gonfiance" should NOT match (soundex dropped)', query: 'gonfiance', expect: 'no match' },
  { label: 'FIXED — "santé" no longer stems to the single letter "s" (stemmer:false)', query: 'santé', expect: 'sante' },
]);

probes.es = await probe('es', [
  { id: 'proteccion', title: 'Protección', excerpt: 'la protección de las comunidades afectadas' },
  { id: 'gobierno', title: 'Gobierno', excerpt: 'los gobiernos y las instituciones públicas' },
], [
  { label: 'diacritics-insensitive: "proteccion"', query: 'proteccion', expect: 'proteccion' },
  { label: 'FIXED — typo "copierno" should NOT match (soundex dropped)', query: 'copierno', expect: 'no match' },
  { label: 'inflection: "gobierno" vs indexed "gobiernos"', query: 'gobierno', expect: 'gobierno' },
]);

probes.ru = await probe('ru', [
  { id: 'doverie', title: 'Доверие', excerpt: 'эрозия доверия к гуманитарным организациям' },
], [
  { label: 'inflection: nominative "доверие" vs indexed genitive "доверия"', query: 'доверие', expect: '(currently no match — too strict)' },
  { label: 'prefix: "довер"', query: 'довер', expect: 'doverie' },
  { label: 'ё/е normalization: "надежный" vs "надёжный"', query: 'надёжный', expect: 'n/a (probe encode only)' },
]);

probes.ar = await probe('ar', [
  { id: 'thiqa', title: 'الثقة', excerpt: 'انعدام الثقة في المؤسسات الإنسانية' },
], [
  { label: 'FIXED — with article "الثقة" (exact word from doc) now matches (rtl:false)', query: 'الثقة', expect: 'thiqa' },
  { label: 'bare stem "ثقة" — the definite article is a prefix, so this still misses', query: 'ثقة', expect: 'thiqa (article prefix blocks it)' },
  { label: 'FIXED — "انعدام" (exact word from doc)', query: 'انعدام', expect: 'thiqa' },
]);

probes.zh = await probe('zh', [
  { id: 'xinren', title: '信任的侵蚀', excerpt: '有害信息削弱了公众对人道机构的信任' },
  { id: 'latin', title: '过滤泡沫', excerpt: '这种在线动态被称为过滤泡沫 Pariser 警告称' },
], [
  { label: 'CJK word query: "信任"', query: '信任', expect: 'xinren' },
  { label: 'CJK word query: "错误信息" (not in corpus verbatim)', query: '错误信息', expect: '(char-context behavior)' },
  { label: 'embedded Latin name: "Pariser"', query: 'Pariser', expect: 'latin (does char-split break it?)' },
]);

// A few direct encode() illustrations for the doc
const enc = {
  en: createFieldEncoder('en'),
  fr: createFieldEncoder('fr'),
  es: createFieldEncoder('es'),
  ru: createFieldEncoder('ru'),
  ar: createFieldEncoder('ar'),
};
const encodeSamples = {
  en: ['government', 'goverment', 'trust', 'crisis', 'who', 'people who fled', 'misinformation', 'disinformation'],
  fr: ['confiance', 'gonfiance', 'santé', 'sante', 'désinformation', "l'information"],
  es: ['protección', 'proteccion', 'gobierno', 'copierno', 'confianza'],
  ru: ['доверие', 'доверия', 'надёжный', 'надежный'],
  ar: ['الثقة', 'ثقة', 'المؤسسات', 'الموسسات'],
};
const encoded = {};
for (const [loc, samples] of Object.entries(encodeSamples)) {
  encoded[loc] = Object.fromEntries(samples.map((s) => [s, enc[loc].encode(s)]));
}

const output = { generatedAt: new Date().toISOString(), flexsearchVersion: '0.8.212', results, probes, encodedSamples: encoded };
mkdirSync(path.join(ROOT, 'search-analysis', 'data'), { recursive: true });
writeFileSync(path.join(ROOT, 'search-analysis', 'data', 'corpus-stats.json'), JSON.stringify(output, null, 2));
console.log('\nWrote search-analysis/data/corpus-stats.json');
console.log('\n--- Probe outcomes ---');
for (const [loc, outcomes] of Object.entries(probes)) {
  for (const o of outcomes) console.log(`[${loc}] ${o.label} -> matched: ${JSON.stringify(o.matchedIds)}`);
}
console.log('\n--- Encoded samples ---');
for (const [loc, samples] of Object.entries(encoded)) {
  for (const [s, e] of Object.entries(samples)) console.log(`[${loc}] "${s}" -> ${JSON.stringify(e)}`);
}
