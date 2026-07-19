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

function customPrepareEn(str) {
  return str
    // Remove footnote references like [^1], [^2], etc.
    .replace(/\[\^[0-9]+\]/g, "")
    // Map acronyms to their full forms
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

function createFieldEncoder(locale) {
  switch (locale) {
    case 'en': return new Encoder(Charset.LatinAdvanced, EnglishPreset, { prepare: customPrepareEn });
    case 'fr': return new Encoder(Charset.LatinBalance, FrenchPreset);
    case 'es': return new Encoder(Charset.LatinBalance);
    case 'zh': return new Encoder(Charset.CJK);
    case 'ar': return new Encoder(Charset.Normalize, { rtl: true});
    case 'ru':
    default:   return new Encoder(Charset.Normalize); // unicode-normalize + lowercase
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
          context: locale === 'zh',
          encoder: createFieldEncoder(locale)
        },
        {
          field: 'excerpt',
          tokenize: locale === 'zh' ? 'strict' : 'forward',
          encoder: createFieldEncoder(locale),
          context: locale === 'zh',
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
