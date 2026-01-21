/**
 * @typedef {import('@stefanprobst/rehype-extract-toc').TocEntry} TocEntry
 * @typedef {import('@stefanprobst/rehype-extract-toc').Toc} Toc
 */
/**
 * Render a hierarchical table of contents for a chapter.
 *
 * @param {{
 *   chapterTableOfContents?: Toc,
 *   title?: string,
 *   maxDepth?: number,
 * }} props
 */
export default function TableOfContent({
  chapterTableOfContents = [],
  title,
  maxDepth = Number.POSITIVE_INFINITY,
}) {
  /**
   * Recursively render the nested `<ul>` structure respecting the maxDepth limit.
   * @param {TocEntry[]} items
   * @param {number} level
   * @returns {import('react').ReactNode}
   */

  const renderItems = (items = [], level = 1) => {
    if (!items.length || level > maxDepth) return null;
    const listClass = level === 1 ? 'pl-2 m-0 list-none' : 'pl-4 mt-2 list-none';
    return (
      <ul className={listClass}>
        {items.map(({ id, value, children = [] }) => (
          <li key={id} className="mb-2">
            <a href={`#${id}`}>
              <div className="text-[#495057] font-bold hover:text-black hover:underline">
                {value}
              </div>
            </a>
            {renderItems(children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };
  return (
    <>
      <div className="text-2xl text-black font-extrabold mb-2">{title}</div>
      <div className="border-l-3 border-l-[#ee2435]">{renderItems(chapterTableOfContents)}</div>
    </>
  );
}
