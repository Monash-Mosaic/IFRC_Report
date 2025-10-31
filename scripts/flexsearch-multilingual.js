// filename: flexsearch-multilingual.js

// Install deps:
// npm install flexsearch node-jieba diacritics
const FlexSearch = require("flexsearch");
const { remove: stripDiacritics } = require("diacritics");
const nodejieba = require("nodejieba");
const fs = require("fs/promises");

/**
 * Language-aware text normalization utilities
 * Keep these pure and deterministic so indexing and querying are consistent.
 */
const normalize = {
  en: (s) => {
    // Lowercase and strip common punctuation
    const lower = s.toLowerCase();
    // Optional: ASCII fold is mostly covered by diacritics removal if needed
    return lower.normalize("NFKC");
  },

  fr: (s) => {
    // Lowercase and strip diacritics so "é" -> "e", "œ" -> "oe"
    const lower = s.toLowerCase();
    const folded = stripDiacritics(lower);
    return folded.normalize("NFKC");
  },

  ru: (s) => {
    // Lowercase + NFKC; normalize Yo/Ё variants by mapping to "е"
    const lower = s.toLowerCase().normalize("NFKC");
    return lower.replace(/ё/g, "е");
  },

  ar: (s) => {
    // Normalize Arabic forms: strip diacritics, unify alef variants, hamza, taa marbuta, and tatweel.
    // Keep only necessary letters, remove kashida (ـ)
    let t = s.normalize("NFKC");
    // Remove diacritics (harakat)
    t = t.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
    // Remove tatweel
    t = t.replace(/\u0640/g, "");
    // Unify alef forms
    t = t.replace(/[\u0622\u0623\u0625]/g, "\u0627"); // آ, أ, إ -> ا
    // Unify hamza on waw/ya?
    t = t.replace(/\u0624/g, "\u0648"); // ؤ -> و
    t = t.replace(/\u0626/g, "\u064A"); // ئ -> ي
    // Map taa marbuta to regular ha for broader matching (optional)
    t = t.replace(/\u0629/g, "\u0647"); // ة -> ه
    // Map alif maksura to ya
    t = t.replace(/\u0649/g, "\u064A"); // ى -> ي
    return t;
  },

  zh: (s) => {
    // Chinese needs segmentation. Keep ASCII words too for mixed content.
    // Normalize width and form; we return the original for encoding, but tokenization will segment.
    return s.normalize("NFKC");
  },
};

/**
 * Tokenizers
 * - Space-based for space-delimited languages
 * - Jieba segmentation for Chinese
 */
const tokenize = {
  en: (s) => s.split(/\s+/).filter(Boolean),
  fr: (s) => s.split(/\s+/).filter(Boolean),
  ru: (s) => s.split(/\s+/).filter(Boolean),
  ar: (s) => s.split(/\s+/).filter(Boolean),
  zh: (s) => {
    // Use node-jieba for Chinese word segmentation.
    // Mix with ASCII words for multilingual strings
    const ascii = s.match(/[a-zA-Z0-9]+/g) || [];
    const han = nodejieba.cutForSearch(s, true); // precise mode
    return [...han, ...ascii].filter(Boolean);
  },
};

/**
 * FlexSearch encoder factory using our per-language normalizers.
 * Encoder maps raw input to a normalized string before indexing and searching.
 */
function makeEncoder(lang) {
  const n = normalize[lang];
  return (str) => n(str);
}

/**
 * Build a language-specific FlexSearch document index
 * We use Document index so we can search across fields easily.
 */
function buildIndex(lang) {
  // Guidance:
  // - encode: our custom normalization
  // - tokenize: 'forward' for typeahead + 'full' for flexible matches; we’ll feed pre-tokenized terms via "context"
  // - suggest: true enables prefix/suggestion behavior
  // - cache: true for small/medium datasets
  // - doc: declare id and indexable fields
  // - rtl UI concerns for Arabic handled at UI level; FlexSearch stores normalized strings

  return new FlexSearch.Document({
    // Balance performance and flexibility
    cache: true,
    // This impacts internal tokenizer; we still preprocess tokens externally
    tokenize: "forward", // good for typeahead; consider 'strict' or 'full' depending on needs
    // Stemming is language-agnostic; we avoid aggressive stemming due to mixed languages
    context: {
      resolution: 5, // boosts proximity relevance
      depth: 3,
      bidirectional: true,
    },
    document: {
      id: "id",
      index: [
        // Index fields; you can tune with per-field options
        { field: "title", tokenize: "forward" },
        { field: "body", tokenize: "full" },
        { field: "tags", tokenize: "forward" },
      ],
      store: ["id", "title", "body", "tags", "lang"],
    },
    // Custom encoder hook
    encode: makeEncoder(lang),
  });
}

/**
 * Unified multilingual index manager.
 * One index per language; you can switch to a single index with language tags, but per-language
 * instances give you cleaner tokenization and normalization.
 */
class MultilingualSearch {
  constructor() {
    this.indices = {
      en: buildIndex("en"),
      fr: buildIndex("fr"),
      ru: buildIndex("ru"),
      ar: buildIndex("ar"),
      zh: buildIndex("zh"),
    };
  }

  /**
   * Add a document
   * doc = { id, title, body, tags: string[], lang: 'en'|'fr'|'ru'|'ar'|'zh' }
   */
  add(doc) {
    const { lang } = doc;
    if (!this.indices[lang]) {
      throw new Error(`Unsupported language: ${lang}`);
    }
    // Pre-tokenize fields per language where helpful, especially zh
    const tok = tokenize[lang];

    const preprocessed = {
      ...doc,
      // For non-Chinese, tokenizers just split words; for zh they segment into words.
      titleTokens: tok(doc.title || ""),
      bodyTokens: tok(doc.body || ""),
      tagsTokens: Array.isArray(doc.tags) ? doc.tags.flatMap((t) => tok(t)) : [],
    };

    // Store tokens in the document text to help FlexSearch scoring via context.
    // Concatenate tokens; FlexSearch still runs its internal tokenize, but we’ve provided better units.
    const merged = {
      id: doc.id,
      lang,
      title: preprocessed.titleTokens.join(" "),
      body: preprocessed.bodyTokens.join(" "),
      tags: preprocessed.tagsTokens.join(" "),
    };

    this.indices[lang].add(merged);
  }

  /**
   * Search with optional language hint.
   * queryOptions = { q, lang?: 'en'|'fr'|'ru'|'ar'|'zh', limit?: number }
   * If no lang, we search all indices and merge.
   */
  async search({ q, lang, limit = 10 }) {
    if (!q || !q.trim()) return [];

    const doSearch = async (index) =>
      index.search(q, {
        index: ["title", "body", "tags"],
        limit,
        // enrich to get stored docs back
        enrich: true,
      });

    if (lang && this.indices[lang]) {
      const res = await doSearch(this.indices[lang]);
      return dedupeAndFlatten(res, limit);
    }

    // Search all languages, merge results
    const results = await Promise.all(
      Object.values(this.indices).map((idx) => doSearch(idx))
    );

    const merged = dedupeAndFlatten(results.flat(), limit);
    return merged;
  }
}

/**
 * Utility to de-duplicate results and flatten the enrich format.
 */
function dedupeAndFlatten(enrichedResults, limit) {
  const seen = new Set();
  const out = [];

  for (const group of enrichedResults) {
    for (const hit of group.result || []) {
      const id = hit.id ?? hit.doc?.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(hit.doc || hit);
      if (out.length >= limit) break;
    }
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Example usage
 */
async function example() {
  const ms = new MultilingualSearch();

  ms.add({
    id: "1",
    lang: "en",
    title: "Distributed Energy Resources",
    body: "Smart grid optimization with DER and battery scheduling.",
    tags: ["energy", "grid", "optimization"],
  });

  ms.add({
    id: "2",
    lang: "fr",
    title: "Énergie distribuée",
    body: "Optimisation du réseau intelligent et stockage.",
    tags: ["énergie", "réseau", "optimisation"],
  });

  ms.add({
    id: "3",
    lang: "ru",
    title: "Распределённые энергетические ресурсы",
    body: "Оптимизация умной сети и планирование батарей.",
    tags: ["энергия", "сеть", "оптимизация"],
  });

  ms.add({
    id: "4",
    lang: "ar",
    title: "مصادر الطاقة الموزعة",
    body: "تحسين الشبكة الذكية وجدولة البطاريات.",
    tags: ["طاقة", "شبكة", "تحسين"],
  });

  ms.add({
    id: "5",
    lang: "zh",
    title: "分布式能源",
    body: "智能电网优化与电池调度。",
    tags: ["能源", "电网", "优化"],
  });

  console.log(await ms.search({ q: "optim", limit: 5 }));       // matches en/fr tags after normalization
  console.log(await ms.search({ q: "оптим", limit: 5 }));       // ru stem begins
  console.log(await ms.search({ q: "تحسين", limit: 5 }));       // ar normalized
  console.log(await ms.search({ q: "优化", lang: "zh", limit: 5 })); // zh segmented

  await ms.indices['en'].export(async (key, data) => {
    await fs.writeFile("./export/" + key, data, "utf8");
  }); // export index if needed

  // ms.indices["en"].export(async (key, value) => console.log(key, value)); // export index if needed
}

example(); // Uncomment to run
