import { NextResponse } from 'next/server';
import { Document } from 'flexsearch';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

import { routing } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

// IMPORTANT: use Node runtime (not Edge)
export const runtime = 'nodejs';
// Optional: force dynamic to avoid static optimization
export const dynamic = 'force-dynamic';

// Cache for the search index (rebuilt on server restart)
/** @type {Document} */
let searchIndex = null;
let sections = null;

/**
 * Extract plain text from MDX content
 */
function extractTextFromMDX(mdxContent) {
  let text = mdxContent;

  // Remove imports
  text = text.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gim, '');

  // Remove exports
  text = text.replace(/^export\s+(const|let|var|default|function)\s+.*?$/gim, '');

  // Remove JSX opening/closing tags but keep content
  text = text.replace(/<\/?\w+[^>]*>/g, ' ');

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // Remove markdown links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove heading markers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic markers
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Split content into searchable sections
 */
function splitIntoSections(mdxContent) {
  const sectionsArray = [];
  const lines = mdxContent.split('\n');
  let currentSection = { heading: '', content: '', level: 0 };
  let sectionId = 0;

  for (const line of lines) {
    // Check for markdown headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if it has content
      if (currentSection.content.trim()) {
        sectionsArray.push({
          id: `section-${sectionId++}`,
          heading: currentSection.heading,
          content: extractTextFromMDX(currentSection.content),
          level: currentSection.level,
        });
      }

      // Start new section
      currentSection = {
        heading: headingMatch[2].trim(),
        content: '',
        level: headingMatch[1].length,
      };
    } else {
      currentSection.content += line + '\n';
    }
  }

  // Add final section
  if (currentSection.content.trim()) {
    sectionsArray.push({
      id: `section-${sectionId++}`,
      heading: currentSection.heading,
      content: extractTextFromMDX(currentSection.content),
      level: currentSection.level,
    });
  }

  return sectionsArray;
}

/**
 * Initialize search index (lazy loading)
 */
function initializeIndex() {
  if (searchIndex && sections) {
    return { index: searchIndex, sections };
  }

  // Path to the MDX chapter file
  const chapterPath = path.join(
    process.cwd(),
    'src/reports/en/wdr25/chapter-02.mdx'
  );

  // Read MDX content
  const mdxContent = fs.readFileSync(chapterPath, 'utf8');

  // Split into sections
  sections = splitIntoSections(mdxContent);

  // Create FlexSearch document index
  searchIndex = new Document({
    document: {
      id: 'id',
      index: ['heading', 'content'],
      store: ['heading', 'content', 'level'],
    },
    tokenize: 'forward',
    cache: true,
    context: {
      resolution: 9,
      depth: 3,
      bidirectional: true,
    },
  });

  // Add all sections to index
  sections.forEach((section) => {
    searchIndex.add(section);
  });

  return { index: searchIndex, sections };
}

/**
 * Highlight matching text in content
 */
function highlightMatches(text, query, contextLength = 150) {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryWords.length === 0) {
    return text.substring(0, contextLength) + '...';
  }

  // Find first occurrence of any query word
  const lowerText = text.toLowerCase();
  let firstIndex = -1;

  for (const word of queryWords) {
    const idx = lowerText.indexOf(word);
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
      firstIndex = idx;
    }
  }

  if (firstIndex === -1) {
    return text.substring(0, contextLength) + '...';
  }

  // Extract context around the match
  const start = Math.max(0, firstIndex - contextLength / 2);
  const end = Math.min(text.length, firstIndex + contextLength / 2);
  let excerpt = text.substring(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';

  return excerpt;
}

/**
 * GET /api/search
 * Search within the chapter content
 *
 * Query params:
 *   - q: search query (required)
 *   - limit: max results (default: 10)
 *   - lang: language code (optional)
 *   - page: page number (default: 1)
 * @type {import('next').NextApiHandler}
 */
export async function GET(request) {
  try {;
    const lang = z
      .enum(routing.locales)
      .catch(routing.defaultLocale)
      .parse(request.query['lang']);
    const t = await getTranslations('SearchApi', lang);
    const parseResult =  z.object({
        q: z.string().trim().min(1, t('errorNoQuery')),
        limit: z.coerce.number().int().min(1, t('errorLimitMin')).default(10),
        page: z.coerce.number().int().min(1, t('errorPageMin')).default(1),
      }).safeParse(request.query);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.errors },
        { status: 400 }
      );
    }
    const { q: query, limit } = parseResult.data;

    // Initialize or get cached index
    const { index } = initializeIndex();

    // Perform search
    const results = index.search(query, { limit, enrich: true });

    // Flatten results from multiple fields
    const allResults = new Map();

    results.forEach((fieldResults) => {
      fieldResults.result.forEach((item) => {
        const doc = item.doc;
        if (!allResults.has(doc.id)) {
          allResults.set(doc.id, {
            id: doc.id,
            heading: doc.heading,
            excerpt: highlightMatches(doc.content, query),
            level: doc.level,
          });
        }
      });
    });

    // Convert to array and limit
    const finalResults = Array.from(allResults.values()).slice(0, limit);

    return NextResponse.json({
      query,
      results: finalResults,
      total: finalResults.length,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
