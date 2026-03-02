import Link from 'next/link';

/**
 * 
 * @param {string} text 
 * @returns {import("react").ReactNode}
 */
export function convertHighlightsReactComponent(text) {
  const testEm = /(<em>.*?<\/em>)/g;
  return text.split(testEm).map((part, index) => {
    if (testEm.test(part)) {
      return (
        <mark key={index} className="font-normal">
          {part.replace(/<\/?em>/g, '')}
        </mark>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function SearchResultCard({ title, highlight, href, resultIndex = 0 }) {
  return (
    <Link
      href={href}
      className="block"
      data-search-result="true"
      data-result-index={resultIndex}
      data-result-title={title}
      data-result-href={href}
    >
      <article className="bg-gray-100 rounded-lg p-6 hover:bg-gray-200 transition-colors cursor-pointer">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{convertHighlightsReactComponent(highlight)}</p>
      </article>
    </Link>
  );
}
