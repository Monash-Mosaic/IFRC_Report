// packages/rehype-remove-footnote-heading/index.js
import { visit } from 'unist-util-visit';

export default function rehypeRemoveFootnoteHeading() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (
        node.properties?.dataFootnotes === true ||
        node.properties?.className?.includes('footnotes')
      ) {
        if (node.children[0]?.tagName === 'h2') {
          node.children.shift();
        }
      }
      if (node.tagName === 'a' && node.properties?.className?.includes('data-footnote-backref')) {
        node.properties.className = [...node.properties.className, 'text-2xl', 'sm:text-base'];
      }
    });
  };
}
