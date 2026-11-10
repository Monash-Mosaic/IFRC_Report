import { parseXmlFileSync } from './parseXml.js';
import { convertToChapterTree } from './chapterTree.js';
import { renderChapter } from './renderChapter.js';

/**
 * Loads and normalizes an XML chapter at build/server-module time.
 *
 * The returned Chapter component closes over plain data; parsing is never
 * performed while rendering the component.
 */
export function loadXmlChapter({
  filePath,
  locale,
  reportSlug,
  chapterNumber,
  assetBasePath,
}) {
  const xml = parseXmlFileSync(filePath);
  const tree = convertToChapterTree(xml, {
    locale,
    reportSlug,
    chapterNumber,
    assetBasePath,
  });
  const Chapter = async function Chapter() {
    return renderChapter(tree);
  };
  return {
    default: Chapter,
    title: tree.title || '',
    subtitle: tree.subtitle || '',
    tableOfContents: tree.tableOfContents || [],
  };
}
