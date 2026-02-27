import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function ChapterCard({
  chapterKey,
  chapterLabel,
  title,
  subtitle,
  thumbnail,
  thumbnailOverlay = 'red',
  tableOfContents = [],
  continueHref,
  report,
  released = true,
}) {
  const t = await getTranslations('ReportDetailPage');

  const thumbnailBgClass = thumbnailOverlay === 'blue' ? 'bg-blue-500' : 'bg-red-500';

  const toAnchor = (item) => {
    if (item.id && !/^\d+$/.test(item.id)) {
      return item.id;
    }
    return item.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const cleanLabel = (value) => value.replace(/\s*\u{1F517}\s*$/u, '').trim();

  const renderTocItems = (items = []) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    return (
      <ol className="list-decimal ml-6 space-y-0.5">
        {items.map((item, index) => (
          <li key={item.id || index} className="text-sm text-gray-700 font-semibold">
            <Link
              href={{
                pathname: '/reports/[report]/[chapter]',
                params: { report, chapter: chapterKey },
                hash: item.id,
              }}
              className="underline hover:text-gray-800"
            >
              {cleanLabel(item.value)}
            </Link>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div className="relative bg-gray-100 overflow-hidden border border-gray-200 shadow-sm">
      <div className="p-4 sm:p-5">
        {/* Mobile: actions pinned top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-2 sm:hidden">
          <button
            onClick={() => tableOfContents.length > 0 && setIsExpanded(!isExpanded)}
            className={`${tableOfContents.length > 0 ? 'cursor-pointer' : 'cursor-default opacity-30'}`}
            aria-label={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
            disabled={tableOfContents.length === 0}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-black" />
            ) : (
              <ChevronDown className="w-5 h-5 text-black" />
            )}
          </button>
          {released ? (
            <Link
              href={continueHref}
              className="border border-red-600 text-red-600 bg-white hover:bg-red-50 px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap"
            >
              {t('sections.continue')}
            </Link>
          ) : (
            <span className="border border-gray-300 text-gray-400 bg-gray-50 px-3 py-1 rounded text-xs font-medium whitespace-nowrap cursor-default">
              {t('sections.comingSoon')}
            </span>
          )}
        </div>

        {/* Main row: thumbnail + content */}
        <div className="flex items-start gap-3 sm:gap-5">
          {/* Thumbnail */}
          <div
            className={`relative w-14 h-14 sm:w-28 sm:h-28 shrink-0 rounded overflow-hidden ${thumbnailBgClass} flex items-center justify-center`}
          >
            {thumbnail ? (
              <>
                <Image src={thumbnail} alt={title} fill className="object-cover" sizes="(max-width: 640px) 56px, 112px" />
                <div
                  className={`absolute inset-0 ${thumbnailOverlay === 'blue' ? 'bg-blue-500/30' : 'bg-red-500/30'}`}
                />
              </>
            ) : (
              <span className="text-white text-[9px] sm:text-xs font-bold text-center px-0.5">{chapterLabel}</span>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              {/* Title block */}
              <div className="flex-1 min-w-0 pr-24 sm:pr-0 sm:pt-1">
                <div className="text-xs sm:text-sm text-red-600 font-normal mb-0.5 sm:mb-1">{chapterLabel}</div>
                <h3 className="text-sm sm:text-lg font-semibold text-black leading-snug">{title}</h3>
                {subtitle && <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-0.5 sm:mt-1">{subtitle}</p>}
              </div>

              {/* Desktop actions */}
              <div className="hidden sm:flex items-center gap-3 shrink-0 mt-5">
                <button
                  onClick={() => tableOfContents.length > 0 && setIsExpanded(!isExpanded)}
                  className={`${tableOfContents.length > 0 ? 'cursor-pointer' : 'cursor-default opacity-30'}`}
                  aria-label={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
                  disabled={tableOfContents.length === 0}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-black" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-black" />
                  )}
                </button>
                {released ? (
                  <Link
                    href={continueHref}
                    className="border border-red-600 text-red-600 bg-white hover:bg-red-50 px-8 py-2.5 rounded text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {t('sections.continue')}
                  </Link>
                ) : (
                  <span className="border border-gray-300 text-gray-400 bg-gray-50 px-8 py-2.5 rounded text-sm font-medium whitespace-nowrap cursor-default">
                    {t('sections.comingSoon')}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded TOC */}
            {isExpanded && tableOfContents.length > 0 && (
              <div className="mt-2 sm:mt-3">{renderTocItems(tableOfContents)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
