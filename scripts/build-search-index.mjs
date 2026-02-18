#!/usr/bin/env node

/**
 * Build FlexSearch seed SQL for Cloudflare D1.
 *
 * Usage:
 *   node scripts/build-search-index.mjs
 *
 * Output:
 *   data/search-seed.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Charset, Document, Encoder } from 'flexsearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'src', 'reports');
const OUTPUT_DIR = path.join(ROOT_DIR, 'data');
const OUTPUT_SQL_PATH = path.join(OUTPUT_DIR, 'search-seed.sql');

const LOCALES = ['en', 'ar', 'es', 'fr', 'ru', 'zh'];

const STOP_WORDS_EN = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'this',
  'but',
  'they',
  'have',
  'had',
  'what',
  'when',
  'where',
  'who',
  'which',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'can',
  'just',
  'should',
  'now',
  'also',
  'or',
  'if',
  'then',
  'been',
  'being',
  'would',
  'could',
  'their',
  'there',
  'these',
  'those',
  'we',
  'our',
  'us',
  'i',
  'you',
  'your',
  'my',
  'me',
  'him',
  'her',
  'she',
  'them',
  'any',
  'about',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'again',
  'further',
  'once',
]);

const excerptEncoder = new Encoder(Charset.Normalize, {
  filter: STOP_WORDS_EN,
});

function createFlexSearchIndex() {
  return new Document({
    cache: 200,
    document: {
      id: 'id',
      index: [
        {
          field: 'title',
          tokenize: 'forward',
          encoder: Charset.Normalize,
        },
        {
          field: 'excerpt',
          tokenize: 'forward',
          encoder: excerptEncoder,
          context: {
            depth: 3,
            resolution: 9,
            bidirectional: true,
          },
        },
      ],
    },
  });
}

function extractTextFromMdx(content) {
  let text = content;

  text = text.replace(/^import\s+.*?;?\s*$/gm, '');
  text = text.replace(/^export\s+const\s+\w+\s*=.*$/gm, '');

  // Remove JSX/MDX components while preserving enclosed text content.
  text = text.replace(/<([A-Za-z][A-Za-z0-9:_-]*)(\s[^>]*)?>([\s\S]*?)<\/\1>/g, '$3');
  text = text.replace(/<[^>]+\/>/g, ' ');
  text = text.replace(/<\/?[^>]+>/g, ' ');
  text = text.replace(/\{[^{}]*\}/g, ' ');

  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

function slugifyHeading(headingText) {
  return headingText
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getChapterMetadata(content) {
  const titleMatch = content.match(/export\s+const\s+title\s*=\s*['"`]([^'"`]+)['"`]/);
  return {
    title: titleMatch ? titleMatch[1] : 'Untitled',
  };
}

function parseSections(content, chapterTitle, chapterId, locale, reportId) {
  const sections = [];
  const textContent = extractTextFromMdx(content);
  const lines = textContent.split('\n');

  let currentSection = {
    title: chapterTitle,
    content: [],
    anchor: '',
  };

  const pushSection = () => {
    const excerpt = currentSection.content.join('\n').replace(/\s+/g, ' ').trim();
    if (!excerpt) {
      return;
    }

    sections.push({
      title: currentSection.title,
      excerpt,
      anchor: currentSection.anchor,
    });
  };

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      pushSection();
      const headingText = headingMatch[1].trim();
      currentSection = {
        title: `${chapterTitle} > ${headingText}`,
        content: [],
        anchor: slugifyHeading(headingText),
      };
      continue;
    }

    if (line.trim()) {
      currentSection.content.push(line);
    }
  }

  pushSection();

  return sections.map((section, index) => ({
    id: `${reportId}-${chapterId}-${locale}-${index}`,
    locale,
    title: section.title,
    excerpt: section.excerpt,
    href: `/reports/${reportId}/${chapterId}${section.anchor ? '#' + section.anchor : ''}`,
  }));
}

function processLocale(locale) {
  const localeDir = path.join(REPORTS_DIR, locale);
  if (!fs.existsSync(localeDir)) {
    console.log(`  Skipping ${locale}: missing directory`);
    return [];
  }

  const reportDirs = fs
    .readdirSync(localeDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));

  const documents = [];

  for (const reportId of reportDirs) {
    const reportDir = path.join(localeDir, reportId);
    const mdxFiles = fs
      .readdirSync(reportDir)
      .filter((fileName) => fileName.endsWith('.mdx'))
      .sort((a, b) => a.localeCompare(b));

    for (const mdxFile of mdxFiles) {
      const chapterId = mdxFile.replace(/\.mdx$/, '');
      const filePath = path.join(reportDir, mdxFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      const { title } = getChapterMetadata(content);
      const sections = parseSections(content, title, chapterId, locale, reportId);
      documents.push(...sections);

      console.log(`  Processed ${locale}/${reportId}/${mdxFile}: ${sections.length} sections`);
    }
  }

  return documents;
}

function buildLocaleArtifacts(locale, documents) {
  const index = createFlexSearchIndex();
  for (const doc of documents) {
    index.add({
      id: doc.id,
      title: doc.title,
      excerpt: doc.excerpt,
    });
  }

  const indexChunks = [];
  index.export((key, data) => {
    indexChunks.push({
      locale,
      seq: indexChunks.length,
      exportKey: key,
      exportData: data,
    });
  });

  return {
    locale,
    documents,
    indexChunks,
  };
}

function toSqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSeedSql(artifactsByLocale) {
  const lines = [
    '-- Auto-generated by scripts/build-search-index.mjs',
    '-- This file seeds FlexSearch persistence tables in D1.',
    'BEGIN TRANSACTION;',
    'DELETE FROM search_index_chunks;',
    'DELETE FROM search_documents;',
  ];

  for (const artifact of artifactsByLocale) {
    const sortedDocuments = [...artifact.documents].sort((a, b) => a.id.localeCompare(b.id));
    for (const doc of sortedDocuments) {
      lines.push(
        `INSERT INTO search_documents (locale, id, title, excerpt, href) VALUES (${toSqlValue(doc.locale)}, ${toSqlValue(doc.id)}, ${toSqlValue(doc.title)}, ${toSqlValue(doc.excerpt)}, ${toSqlValue(doc.href)});`
      );
    }

    for (const chunk of artifact.indexChunks) {
      lines.push(
        `INSERT INTO search_index_chunks (locale, seq, export_key, export_data) VALUES (${toSqlValue(chunk.locale)}, ${chunk.seq}, ${toSqlValue(chunk.exportKey)}, ${toSqlValue(chunk.exportData)});`
      );
    }
  }

  lines.push('COMMIT;');
  lines.push('');

  return lines.join('\n');
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function buildSearchSeedSql() {
  console.log('Building FlexSearch seed SQL for D1...\n');

  const artifactsByLocale = [];

  for (const locale of LOCALES) {
    console.log(`Processing locale: ${locale}`);
    const documents = processLocale(locale);
    const artifacts = buildLocaleArtifacts(locale, documents);
    artifactsByLocale.push(artifacts);
    console.log(
      `  Documents: ${artifacts.documents.length}, index chunks: ${artifacts.indexChunks.length}\n`
    );
  }

  const seedSql = buildSeedSql(artifactsByLocale);

  ensureOutputDir();
  fs.writeFileSync(OUTPUT_SQL_PATH, seedSql, 'utf-8');

  const totalDocs = artifactsByLocale.reduce((sum, item) => sum + item.documents.length, 0);
  const totalChunks = artifactsByLocale.reduce((sum, item) => sum + item.indexChunks.length, 0);

  console.log(`✅ Generated ${OUTPUT_SQL_PATH}`);
  console.log(`   Total documents: ${totalDocs}`);
  console.log(`   Total index chunks: ${totalChunks}`);
}

buildSearchSeedSql();
