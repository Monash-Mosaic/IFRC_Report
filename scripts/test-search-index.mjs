import { promises as fs } from 'fs';
import { mdxjs } from 'micromark-extension-mdxjs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx';
import { toMarkdown } from 'mdast-util-to-markdown';
import path from 'path';
import { fileURLToPath } from 'url';
import { title } from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chapter = path.join(__dirname, '..', 'src', 'reports', 'en', 'wdr25', 'chapter-02.mdx');

const doc = await fs.readFile(chapter, 'utf-8');

const tree = fromMarkdown(doc, {
  extensions: [mdxjs()],
  mdastExtensions: [mdxFromMarkdown()],
})

const indices = [
  {
    id: 'chapter-introduction',
    chapter: {
      title: 'Chapter 2 Introduction',
      subtitle: 'Key Topics Overview',
    },
    heading: 'Introduction',
    content: 'This chapter provides an overview of the key topics discussed in the report. It sets the stage for the detailed analysis that follows in subsequent sections.'
  }
]

// console.log('Parsed tree:', JSON.stringify(tree, null, 2))
await fs.writeFile(path.join(__dirname, 'chapter-02-tree.json'), JSON.stringify(filteredTree, null, 2));
// const out = toMarkdown(tree, {
//   extensions: [mdxToMarkdown()]
// })

// console.log('Converted back to markdown:', out)

