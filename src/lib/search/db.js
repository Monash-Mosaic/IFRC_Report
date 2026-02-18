import { Document, Charset, Encoder } from 'flexsearch';
import Database from './d1-database.js';
import stopword from 'stopwords-en';

const LOCALES = new Set(['ar', 'en', 'es', 'fr', 'ru', 'zh']);

function createFieldEncoder(locale, field) {
  // Keep current English behavior for excerpt scoring.
  if (locale === 'en' && field === 'excerpt') {
    return new Encoder(Charset.LatinSoundex, { filter: stopword });
  }

  // Chinese requires CJK token split support.
  if (locale === 'zh') {
    return Charset.CJK;
  }

  // Arabic and Cyrillic scripts rely on normalized unicode matching.
  if (locale === 'ar') {
    return {
      ...Charset.Default,
      rtl: true,
    };
  }

  if (locale === 'ru') {
    return Charset.Default;
  }

  // Romance languages and English use latin-focused encoders.
  return Charset.LatinAdvanced;
}

function normalizeOptions(options) {
  if (!options) {
    return { engine: 'd1', db: null };
  }

  if (typeof options === 'string') {
    return { engine: options, db: null };
  }

  return {
    engine: options.engine || 'd1',
    db: options.db || null,
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

  return env.SEARCH_DB;
}

export async function createSearchIndex(locale, options) {
  const normalized = normalizeOptions(options);
  const engine = normalized.engine === 'sqlite' ? 'd1' : normalized.engine;

  if (!LOCALES.has(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  const doc = new Document({
    document: {
      id: "id",
      store: true,
      field: [
        {
          field: 'title',
          tokenize: 'forward',
          encoder: createFieldEncoder(locale, 'title'),
        },
        {
          field: 'excerpt',
          tokenize: 'forward',
          encoder: createFieldEncoder(locale, 'excerpt'),
          context: true,
        },
      ],
    },
  });

  const d1 = await resolveSearchDatabase(normalized.db);
  const name = `ifrc-wdr-playbook-${locale}-db`;
  const db = new Database(name, {
    db: d1,
  });
  await doc.mount(db);
  return doc;
}
