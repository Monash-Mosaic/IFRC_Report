// lib/rehype-remove-footnote-heading.js (or plugins/rehype-remove-footnote-heading.js)
import { visit } from 'unist-util-visit';

export default function rehypeRemoveFootnoteHeading() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Find the footnotes section
      if (
        node.properties?.dataFootnotes === true ||
        node.properties?.className?.includes('footnotes')
      ) {
        // Remove the first child if it's a heading
        if (node.children[0]?.tagName === 'h2') {
          node.children.shift();
        }
      }
    });
  };
}
