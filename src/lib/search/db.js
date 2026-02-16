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
const SEARCH_DB_PATH = path.join(OUTPUT_DIR, 'search.db');

async function ensureOutputDir() {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

export async function createSearchIndex(locale) {
  await ensureOutputDir();

  const db = new Database('ifrc-report-db', {
    path: SEARCH_DB_PATH,
  });
  switch (locale) {
    case 'en':
      const doc = new Document({
        document: {
          store: true,
          field: [
            {
              field: 'heading',
              tokenize: 'forward',
              encoder: Charset.LatinAdvanced,
            },
            {
              field: 'excerpt',
              tokenize: 'forward',
              encoder: new Encoder(Charset.LatinSoundex, { filter: stopword }),
              context: true,
            },
          ],
        },
      });
      await doc.mount(db);
      return doc;
    default:
      throw new Error('Unsupported Locale');
  }
}
