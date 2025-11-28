/**
 * FlexSearch indexer for MDX chapter content
 * Builds a searchable index from MDX files
 */

import { Document } from 'flexsearch';
import fs from 'fs';
import path from 'path';

/**
 * Extract plain text from MDX content
 * Removes JSX components, imports, exports, and code blocks
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
 * Breaks content by headings for better context
 */
function splitIntoSections(mdxContent) {
  const sections = [];
  const lines = mdxContent.split('\n');
  let currentSection = { heading: '', content: '', level: 0 };
  let sectionId = 0;

  for (const line of lines) {
    // Check for markdown headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if it has content
      if (currentSection.content.trim()) {
        sections.push({
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
    sections.push({
      id: `section-${sectionId++}`,
      heading: currentSection.heading,
      content: extractTextFromMDX(currentSection.content),
      level: currentSection.level,
    });
  }

  return sections;
}

/**
 * Create FlexSearch index from MDX file
 */
export function createSearchIndex(chapterPath) {
  // Read MDX file
  const mdxContent = fs.readFileSync(chapterPath, 'utf8');

  // Split into sections
  const sections = splitIntoSections(mdxContent);

  // Create FlexSearch document index
  const index = new Document({
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
    index.add(section);
  });

  return { index, sections };
}

/**
 * Search the index
 */
export function searchIndex(index, query, limit = 10) {
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
          content: doc.content,
          level: doc.level,
          score: item.score || 1,
        });
      }
    });
  });

  // Convert to array and sort by relevance
  return Array.from(allResults.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Export index as JSON for client-side usage
 */
export function exportIndexToJSON(index, sections) {
  return {
    sections,
    // FlexSearch doesn't have a direct export, so we store sections
    // and rebuild index on client if needed
    timestamp: new Date().toISOString(),
  };
}
