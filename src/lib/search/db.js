import { Document, Charset, Encoder } from 'flexsearch';
import EnglishPreset from "flexsearch/lang/en";
import FrenchPreset from "flexsearch/lang/fr";

import Database from './d1-database.js';

const LOCALES = new Set(['ar', 'en', 'es', 'fr', 'ru', 'zh']);

function normalizeNamespace(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || null;
}

// Straight (') and curly ('/') apostrophes are not letters or numbers, so FlexSearch's
// default word split (/[^\p{L}\p{N}]+/u) treats them as hard separators - "today's" would
// index as two tokens, "today" and "s", flooding the index with near-meaningless
// single-letter tokens from every contraction/possessive in the corpus. Removing the
// apostrophe keeps the contraction as one token ("today's" -> "todays") instead.
function stripApostrophes(str) {
  return str.replace(/['‘’]/g, '');
}

// French uses the apostrophe for elision ("l'IA", "d'intelligence", "qu'elles"), where it
// joins a short particle to a genuinely separate following word. Simply removing it the way
// stripApostrophes does would fuse the two into "lia"/"dintelligence" - which is how the
// "IA" token disappeared from French documents entirely. Drop the elided particle instead so
// the real word survives on its own. A long run before the apostrophe is not elision
// ("aujourd'hui"), so that still just joins.
function stripApostrophesFr(str) {
  return str.replace(/\b\p{L}{1,2}['‘’]/gu, ' ').replace(/['‘’]/g, '');
}

// [acronym, expansion] pairs. Expansions must be written in the form the encoder actually
// sees - lowercase and accent-free - because FlexSearch NFKD-normalizes and lowercases the
// input *before* calling `prepare`, so anything injected here is never normalized again. An
// accented expansion would emit a token no real text can ever produce.
const EN_ACRONYMS = [
  ['ai', 'artificial intelligence'],
  ['car', 'central african republic'],
  ['cbs', 'community-based surveillance'],
  ['cdac', 'communicating with disaster affected communities'],
  ['cea', 'community engagement and accountability'],
  ['cred', 'centre for research on the epidemiology of disasters'],
  ['cso', 'civil society organization'],
  ['drc', 'democratic republic of the congo'],
  ['dref', 'disaster response emergency fund'],
  ['drm', 'disaster risk management'],
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
  ['sdg', 'sustainable development goal'],
  ['undp', 'un development programme'],
  ['unhcr', 'un high commissioner for refugees'],
  ['who', 'world health organization'],
];

const FR_ACRONYMS = [
  ['cbs', 'surveillance a base communautaire'],
  ['cdac', 'communiquer avec les communautes touchees par une catastrophe'],
  ['cea', 'engagement des communautes et redevabilite'],
  ['cicr', 'comite international de la croix-rouge'],
  ['cred', 'centre de recherche sur epidemiologie des catastrophes'],
  ['dref', 'fonds urgence pour intervention en cas de catastrophe'],
  ['em-dat', 'base de donnees sur les situations urgence'],
  ['emdat', 'base de donnees sur les situations urgence'],
  ['giec', 'groupe experts intergouvernemental sur evolution du climat'],
  ['hcr', 'haut-commissariat des nations unies pour les refugies'],
  ['ia', 'intelligence artificielle'],
  ['idmc', 'centre pour la surveillance des deplacements internes'],
  ['ifrc', 'federation internationale des societes de la croix-rouge et du croissant-rouge'],
  ['oecd', 'organisation de cooperation et de developpement economiques'],
  ['ocha', 'bureau de la coordination des affaires humanitaires des nations unies'],
  ['odd', 'objectif de developpement durable'],
  ['oms', 'organisation mondiale de la sante'],
  ['ong', 'organisation non gouvernementale'],
  ['pnud', 'programme des nations unies pour le developpement'],
  ['rcce', 'communication sur les risques et engagement des communautes'],
  ['rdc', 'republique democratique du congo'],
  ['tic', 'technologies de information et de la communication'],
  ['uit', 'union internationale des telecommunications'],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Matches a spelled-out expansion in the source text, tolerating any whitespace run between
// words (the corpus is line-wrapped). Apostrophes are already normalized away by the time this
// runs, which is why the expansions above are written without them.
function expansionPattern(expansion) {
  const body = expansion.split(/\s+/).map(escapeRegex).join('\\s+');
  return new RegExp(`\\b${body}\\b`, 'g');
}

// Search is AND-based (`suggest: false` in flexsearch.js), so every term the query encodes to
// must be present in a document. Expanding only acronym -> expansion made that one-directional:
// "CEA" encoded to [cea, community, engagement, accountability] and therefore only ever matched
// documents that literally spell out "CEA", never the ones that only write the phrase out in
// full. Collapsing the expansion back to its acronym first makes both spellings converge on the
// same token set, so either one finds both kinds of document.
function buildAcronymExpander(pairs) {
  const rules = pairs.map(([acronym, expansion]) => ({
    acronym,
    expansionPattern: expansionPattern(expansion),
    acronymPattern: new RegExp(`\\b${escapeRegex(acronym)}\\b`, 'g'),
    expanded: `${acronym} ${expansion}`,
  }));

  return function expandAcronyms(str) {
    for (const rule of rules) {
      str = str.replace(rule.expansionPattern, rule.acronym);
    }
    for (const rule of rules) {
      str = str.replace(rule.acronymPattern, rule.expanded);
    }
    return str;
  };
}

const expandEnAcronyms = buildAcronymExpander(EN_ACRONYMS);
const expandFrAcronyms = buildAcronymExpander(FR_ACRONYMS);

// Remove footnote references like [^1], [^2], etc.
function stripFootnotes(str) {
  return str.replace(/\[\^[0-9]+\]/g, '');
}

// Apostrophes are normalized before acronym matching so both the corpus and the expansions
// above are in the same shape by the time patterns are applied.
function prepareEn(str) {
  // return expandEnAcronyms(stripApostrophes(stripFootnotes(str)));
  return stripApostrophes(stripFootnotes(str));
}

function prepareFr(str) {
  return expandFrAcronyms(stripApostrophesFr(stripFootnotes(str)));
}

function createFieldEncoder(locale) {
  switch (locale) {
    case 'en': return new Encoder(Charset.Normalize, EnglishPreset, { prepare: prepareEn,stemmer: false });
    case 'fr': return new Encoder(Charset.Normalize, FrenchPreset, { prepare: prepareFr, stemmer: false });
    case 'es': return new Encoder(Charset.Normalize, { prepare: stripApostrophes, stemmer: false });
    case 'zh': return new Encoder(Charset.CJK);
    case 'ar': return new Encoder(Charset.Normalize, { prepare: stripApostrophes, rtl: false });
    case 'ru':
    default:   return new Encoder(Charset.Normalize, { prepare: prepareEn, stemmer: false }); // unicode-normalize + lowercase
  }
}

function normalizeOptions(options) {
  const envNamespace = normalizeNamespace(process.env.NEXT_PUBLIC_GIT_TAG);

  if (!options) {
    return { engine: 'd1', db: null, namespace: envNamespace };
  }

  if (typeof options === 'string') {
    return { engine: options, db: null, namespace: envNamespace };
  }

  const optionNamespace = normalizeNamespace(options.namespace);

  return {
    engine: options.engine || 'd1',
    db: options.db || null,
    namespace: optionNamespace || envNamespace,
  };
}

async function resolveSearchDatabase(explicitDb) {
  if (explicitDb) {
    return explicitDb;
  }

  const { getCloudflareContext } = await import('@opennextjs/cloudflare');
  const { env } = await getCloudflareContext({ async: true });
  if (!env?.SEARCH_DB) {
    throw new Error('SEARCH_DB binding is not configured.');
  }

  return env.SEARCH_DB.withSession();
}

export function createDocument(locale) {
  return new Document({
    document: {
      id: "id",
      store: true,
      field: [
        {
          field: 'title',
          tokenize: locale === 'zh' ? 'strict' : 'forward',
          context: {
            bidirectional: true,
            depth: 3,
            resolution: 100
          },
          encoder: createFieldEncoder(locale)
        },
        {
          field: 'excerpt',
          tokenize: locale === 'zh' ? 'strict' : 'forward',
          encoder: createFieldEncoder(locale),
          context: {
            bidirectional: true,
            depth: 3,
            resolution: 100
          },
        },
      ],
    },
  });
}

export async function createSearchIndex(locale, options) {
  const normalized = normalizeOptions(options);

  if (!LOCALES.has(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  const doc = createDocument(locale);

  const d1 = await resolveSearchDatabase(normalized.db);
  const baseName = `ifrc-wdr-playbook-${locale}-db`;
  const name = normalized.namespace ? `${baseName}-${normalized.namespace}` : baseName;
  const db = new Database(name, {
    db: d1,
  });
  await doc.mount(db);
  doc.db = db;
  return doc;
}
