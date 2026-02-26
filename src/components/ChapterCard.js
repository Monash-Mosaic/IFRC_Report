'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/**
 * Renders a single chapter card with expand/collapse functionality
 * @param {Object} props
 * @param {string} props.chapterKey - The chapter key/slug
 * @param {string} props.chapterLabel - The chapter label (e.g., "Chapter 1", "Synthesis")
 * @param {string} props.title - Chapter title
 * @param {string} props.subtitle - Chapter subtitle
 * @param {string} props.thumbnail - Thumbnail image path
 * @param {string} props.thumbnailOverlay - Color overlay ('red' or 'blue')
 * @param {Array} props.tableOfContents - Table of contents items
 * @param {string} props.continueHref - Link to continue reading
 */
export default function ChapterCard({
  chapterKey,
  chapterLabel,
  title,
  subtitle,
  thumbnail,
  thumbnailOverlay = 'red',
  tableOfContents = [],
  continueHref,
  report,
}) {
  const t = useTranslations('ReportDetailPage');
  const [isExpanded, setIsExpanded] = useState(false);

  const thumbnailBgClass = thumbnailOverlay === 'blue' ? 'bg-blue-500' : 'bg-red-500';

  /**
   * Generate anchor slug from TOC item value
   * @param {string} value - The heading text
   * @returns {string} The slugified anchor
   */
  const toAnchor = (item) => {
    if (item.id && !/^\d+$/.test(item.id)) {
      return item.id;
    }
    return item.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  /**
   * Recursively render table of contents items as clickable links
   * @param {Array} items - TOC items
   * @param {number} level - Current nesting level
   * @returns {import('react').ReactNode}
   */
  const renderTocItems = (items = [], level = 1) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    return (
      <ol className="list-decimal ml-6 space-y-1">
        {items.map((item, index) => (
          <li key={item.id || index} className="text-sm text-gray-700">
            <Link
              href={{
                pathname: '/reports/[report]/[chapter]',
                params: { report, chapter: chapterKey },
                hash: toAnchor(item),
              }}
              className="underline hover:text-black"
            >
              {item.value}
            </Link>
            {item.children && Array.isArray(item.children) && item.children.length > 0 && (
              <div className="ml-4 mt-1">{renderTocItems(item.children, level + 1)}</div>
            )}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div className="bg-gray-100 overflow-hidden border border-gray-200 shadow-sm">
      <div className="p-5">
        {/* Top row: thumbnail + title + chevron + continue */}
        <div className="flex items-start gap-5">
          {/* Thumbnail */}
          <div
            className={`relative w-28 h-28 shrink-0 rounded overflow-hidden ${thumbnailBgClass} flex items-center justify-center`}
          >
            {thumbnail ? (
              <>
                <Image src={thumbnail} alt={title} fill className="object-cover" sizes="112px" />
                <div
                  className={`absolute inset-0 ${thumbnailOverlay === 'blue' ? 'bg-blue-500/30' : 'bg-red-500/30'}`}
                />
              </>
            ) : (
              <span className="text-white text-xs font-bold text-center px-1">{chapterLabel}</span>
            )}
          </div>

          {/* Title area */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="text-sm text-red-600 font-semibold mb-1">{chapterLabel}</div>
            <h3 className="text-lg font-bold text-black leading-snug">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>

          {/* Chevron toggle */}
          {tableOfContents.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 p-1 hover:bg-gray-100 rounded transition-colors self-center"
              aria-label={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
            >
              {isExpanded ? (
                <ChevronUp className="w-6 h-6 text-black" />
              ) : (
                <ChevronDown className="w-6 h-6 text-black" />
              )}
            </button>
          )}

          {/* Continue button - outlined style */}
          <Link
            href={continueHref}
            className="shrink-0 self-center border border-red-600 text-red-600 hover:bg-red-50 px-8 py-2.5 rounded text-sm font-medium transition-colors whitespace-nowrap"
          >
            {t('sections.continue')}
          </Link>
        </div>

        {/* Expanded: Table of Contents dropdown */}
        {isExpanded && tableOfContents.length > 0 && (
          <div className="mt-4 ml-[8.25rem]">{renderTocItems(tableOfContents)}</div>
        )}
      </div>
    </div>
  );
}
