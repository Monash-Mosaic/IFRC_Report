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

function customPrepare(str) {
  return str
    // Remove footnote references like [^1], [^2], etc.
    .replace(/\[\^[0-9]+\]/g, "");
};

function mapAcronyms(str) {
  return str
    .replace(/AI/g, "Artificial Intelligence")
    .replace(/CAR/g, "Central African Republic")
    .replace(/CBS/g, "Community-based surveillance")
    .replace(/CDAC/g, "Communicating with Disaster Affected Communities")
    .replace(/CEA/g, "Community engagement and accountability")
    .replace(/CRED/g, "Centre for Research on the Epidemiology of Disasters")
    .replace(/CSO/g, "Civil society organization")
    .replace(/DRC/g, "Democratic Republic of the Congo")
    .replace(/DREF/g, "Disaster Response Emergency Fund")
    .replace(/DRM/g, "Disaster risk management")
    .replace(/ICRC/g, "International Committee of the Red Cross")
    .replace(/ICT/g, "Information and communication technology")
    .replace(/IDMC/g, "Internal Displacement Monitoring Centre")
    .replace(/IFRC/g, "International Federation of Red Cross and Red Crescent Societies")
    .replace(/ITU/g, "International Telecommunication Union")
    .replace(/MDH/g, "Misinformation, disinformation and hate speech")
    .replace(/MHPSS/g, "Mental health and psychosocial support")
    .replace(/NGO/g, "Non-governmental organization")
    .replace(/OCHA/g, "Office for the Coordination of Humanitarian Affairs (UN)")
    .replace(/OECD/g, "Organisation for Economic Co-operation and Development")
    .replace(/Q&A/g, "Questions and answers")
    .replace(/RCCE/g, "Risk Communication and Community Engagement")
    .replace(/SDG/g, "Sustainable Development Goal")
    .replace(/UNDP/g, "UN Development Programme")
    .replace(/UNHCR/g, "UN High Commissioner for Refugees")
    .replace(/WHO/g, "World Health Organization");
}

function createFieldEncoder(locale) {
  switch (locale) {
    case 'en': return new Encoder(Charset.LatinAdvanced, EnglishPreset, { prepare: customPrepare });
    case 'fr': return new Encoder(Charset.LatinBalance, FrenchPreset, { prepare: customPrepare });
    case 'es': return new Encoder(Charset.LatinBalance, { prepare: customPrepare });
    case 'zh': return new Encoder(Charset.CJK, { prepare: customPrepare });
    case 'ar': return new Encoder(Charset.Normalize, { rtl: true, prepare: customPrepare });
    case 'ru':
    default:   return new Encoder(Charset.Normalize, { prepare: customPrepare }); // unicode-normalize + lowercase
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
