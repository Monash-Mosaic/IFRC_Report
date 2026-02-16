import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, Charset, Encoder } from 'flexsearch';
import Database from 'flexsearch/db/sqlite';
import stopword from 'stopwords-en';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'data');

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

async function ensureOutputDir() {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

export async function createSearchIndex(locale, engine = 'sqlite') {
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

  if (engine === 'sqlite') {
    await ensureOutputDir();
    const name = `ifrc-wdr-playbook-${locale}-db`;
    const db = new Database(name, {
      path: path.join(OUTPUT_DIR, `${name}.sqlite`),
    });
    await doc.mount(db);
  }

  return doc;
}
