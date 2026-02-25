import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = pathResolve(__dirname, '..', '..');
const wranglerConfigPath = pathResolve(projectRoot, 'wrangler.jsonc');

const PROD_PLACEHOLDER = '__D1_SEARCH_DB_ID_PROD__';
const PREVIEW_PLACEHOLDER = '__D1_SEARCH_DB_ID_PREVIEW__';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function assertUuid(name, value) {
  if (!UUID_REGEX.test(value)) {
    throw new Error(`Invalid UUID format for ${name}`);
  }
}

async function run() {
  const prodId = requireEnv('CF_D1_SEARCH_DB_ID_PROD');
  const previewId = requireEnv('CF_D1_SEARCH_DB_ID_PREVIEW');

  assertUuid('CF_D1_SEARCH_DB_ID_PROD', prodId);
  assertUuid('CF_D1_SEARCH_DB_ID_PREVIEW', previewId);

  const configRaw = await readFile(wranglerConfigPath, 'utf8');

  if (!configRaw.includes(PROD_PLACEHOLDER) || !configRaw.includes(PREVIEW_PLACEHOLDER)) {
    throw new Error(
      `Expected placeholders not found in ${wranglerConfigPath}. Ensure wrangler.jsonc uses CI placeholders.`
    );
  }

  let output = configRaw;
  output = output.replaceAll(PROD_PLACEHOLDER, prodId);
  output = output.replaceAll(PREVIEW_PLACEHOLDER, previewId);

  if (output.includes(PROD_PLACEHOLDER) || output.includes(PREVIEW_PLACEHOLDER)) {
    throw new Error('Placeholder replacement incomplete.');
  }

  await writeFile(wranglerConfigPath, output, 'utf8');
  console.log('[inject-d1-database-ids] Updated wrangler.jsonc with CI-provided D1 database IDs.');
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[inject-d1-database-ids] ${message}`);
  process.exit(1);
});
