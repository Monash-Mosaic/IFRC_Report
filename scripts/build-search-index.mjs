#!/usr/bin/env node

/**
 * Build Search Index Script
 *
 * This script extracts content from MDX files and builds a SQLite FTS5 database
 * for full-text search functionality.
 *
 * Usage: node scripts/build-search-index.mjs
 *
 * The database is stored in data/search.db and can be regenerated at any time.
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'data', 'search.db');
const REPORTS_DIR = path.join(ROOT_DIR, 'src', 'reports');

// Supported locales
const LOCALES = ['en', 'ar', 'es', 'fr', 'ru', 'zh'];

/**
 * Extract text content from MDX, removing JSX components and imports
 */
function extractTextFromMdx(content) {
  // Remove import statements
  let text = content.replace(/^import\s+.*?;?\s*$/gm, '');

  // Remove export statements (but keep the content)
  text = text.replace(/^export\s+const\s+\w+\s*=\s*/gm, '');

  // Remove JSX component tags but keep inner content
  // e.g., <SideNote>content</SideNote> -> content
  text = text.replace(/<(\w+)[^>]*>([\s\S]*?)<\/\1>/g, (match, tag, inner) => {
    // Skip certain components that don't have searchable content
    if (['Contributors', 'ContributorRole'].includes(tag)) {
      return '';
    }
    return inner;
  });

  // Remove self-closing tags
  text = text.replace(/<\w+[^>]*\/>/g, '');

  // Remove remaining opening tags
  text = text.replace(/<\w+[^>]*>/g, '');

  // Remove closing tags
  text = text.replace(/<\/\w+>/g, '');

  // Remove curly braces content (JSX expressions)
  text = text.replace(/\{[^}]*\}/g, '');

  // Clean up extra whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * Parse MDX content into sections based on headings
 */
function parseSections(content, chapterTitle, chapterId, locale, reportId) {
  const sections = [];
  const textContent = extractTextFromMdx(content);

  // Split by headings (# Title)
  const lines = textContent.split('\n');
  let currentSection = {
    title: chapterTitle,
    content: [],
    anchor: '',
  };

  for (const line of lines) {
    // Check for heading (# or ##)
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if it has content
      if (currentSection.content.length > 0) {
        sections.push({
          ...currentSection,
          content: currentSection.content.join('\n').trim(),
        });
      }

      // Start new section
      const headingText = headingMatch[2].trim();
      const anchor = headingText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      currentSection = {
        title: `${chapterTitle} > ${headingText}`,
        content: [],
        anchor,
      };
    } else {
      // Add line to current section
      if (line.trim()) {
        currentSection.content.push(line);
      }
    }
  }

  // Don't forget the last section
  if (currentSection.content.length > 0) {
    sections.push({
      ...currentSection,
      content: currentSection.content.join('\n').trim(),
    });
  }

  // Create document records
  return sections.map((section, index) => ({
    id: `${reportId}-${chapterId}-${locale}-${index}`,
    locale,
    title: section.title,
    content: section.content,
    href: `/reports/${reportId}/${chapterId}${section.anchor ? '#' + section.anchor : ''}`,
    reportId,
    chapterId,
  }));
}

/**
 * Get chapter metadata from MDX exports
 */
function getChapterMetadata(content) {
  const titleMatch = content.match(/export\s+const\s+title\s*=\s*['"`]([^'"`]+)['"`]/);
  const subtitleMatch = content.match(/export\s+const\s+subtitle\s*=\s*['"`]([^'"`]+)['"`]/);

  return {
    title: titleMatch ? titleMatch[1] : 'Untitled',
    subtitle: subtitleMatch ? subtitleMatch[1] : '',
  };
}

/**
 * Process all MDX files for a locale
 */
function processLocale(locale) {
  const documents = [];
  const localeDir = path.join(REPORTS_DIR, locale);

  if (!fs.existsSync(localeDir)) {
    console.log(`  Skipping ${locale} - directory not found`);
    return documents;
  }

  // Find all report directories
  const reportDirs = fs
    .readdirSync(localeDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const reportId of reportDirs) {
    const reportDir = path.join(localeDir, reportId);

    // Find all MDX files
    const mdxFiles = fs.readdirSync(reportDir).filter((file) => file.endsWith('.mdx'));

    for (const mdxFile of mdxFiles) {
      const chapterId = mdxFile.replace('.mdx', '');
      const filePath = path.join(reportDir, mdxFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      const metadata = getChapterMetadata(content);
      const sections = parseSections(content, metadata.title, chapterId, locale, reportId);

      documents.push(...sections);
      console.log(`  Processed ${locale}/${reportId}/${mdxFile} - ${sections.length} sections`);
    }
  }

  return documents;
}

/**
 * Create and populate the database
 */
function buildDatabase() {
  console.log('Building search index...\n');

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Remove existing database
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Removed existing database\n');
  }

  // Create new database
  const db = new Database(DB_PATH);

  // Create tables
  db.exec(`
    -- Main documents table
    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      locale TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      href TEXT NOT NULL,
      report_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL
    );
    
    -- FTS5 virtual table for full-text search
    -- Using porter tokenizer for stemming (English)
    CREATE VIRTUAL TABLE search_fts USING fts5(
      title,
      content,
      content='documents',
      content_rowid='rowid',
      tokenize='porter unicode61 remove_diacritics 2'
    );
    
    -- Triggers to keep FTS index in sync
    CREATE TRIGGER documents_ai AFTER INSERT ON documents BEGIN
      INSERT INTO search_fts(rowid, title, content)
      VALUES (new.rowid, new.title, new.content);
    END;
    
    CREATE TRIGGER documents_ad AFTER DELETE ON documents BEGIN
      INSERT INTO search_fts(search_fts, rowid, title, content)
      VALUES('delete', old.rowid, old.title, old.content);
    END;
    
    CREATE TRIGGER documents_au AFTER UPDATE ON documents BEGIN
      INSERT INTO search_fts(search_fts, rowid, title, content)
      VALUES('delete', old.rowid, old.title, old.content);
      INSERT INTO search_fts(rowid, title, content)
      VALUES (new.rowid, new.title, new.content);
    END;
    
    -- Index for locale filtering
    CREATE INDEX idx_documents_locale ON documents(locale);
  `);

  console.log('Created database schema\n');

  // Process each locale
  const allDocuments = [];
  for (const locale of LOCALES) {
    console.log(`Processing locale: ${locale}`);
    const docs = processLocale(locale);
    allDocuments.push(...docs);
    console.log(`  Total: ${docs.length} documents\n`);
  }

  // Insert documents
  const insert = db.prepare(`
    INSERT INTO documents (id, locale, title, content, href, report_id, chapter_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((docs) => {
    for (const doc of docs) {
      insert.run(doc.id, doc.locale, doc.title, doc.content, doc.href, doc.reportId, doc.chapterId);
    }
  });

  insertMany(allDocuments);

  console.log(`\n✅ Successfully indexed ${allDocuments.length} documents`);
  console.log(`Database saved to: ${DB_PATH}`);

  // Show some stats
  const stats = db
    .prepare(
      `
    SELECT locale, COUNT(*) as count
    FROM documents
    GROUP BY locale
  `
    )
    .all();

  console.log('\nDocuments per locale:');
  for (const stat of stats) {
    console.log(`  ${stat.locale}: ${stat.count}`);
  }

  db.close();
}

// Run the build
buildDatabase();
