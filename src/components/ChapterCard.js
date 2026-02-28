import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
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
  translations = {},
}) {
  const thumbnailBgClass = thumbnailOverlay === 'blue' ? 'bg-blue-500' : 'bg-red-500';

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
              {item.value}
            </Link>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div className="relative bg-gray-100 overflow-hidden border border-gray-200 shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="md:flex md:items-start gap-3 sm:gap-5">
          <div className="flex md:flex-1 gap-3">
            {/* Thumbnail */}
            <div
              className={`relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded overflow-hidden ${thumbnailBgClass} flex items-center justify-center`}
            >
              {thumbnail ? (
                <>
                  <Image src={thumbnail} alt={title} fill className="object-cover" sizes="(max-width: 640px) 80px, 112px" />
                  <div
                    className={`absolute inset-0 ${thumbnailOverlay === 'blue' ? 'bg-blue-500/30' : 'bg-red-500/30'}`}
                  />
                </>
              ) : (
                <span className="text-white text-[9px] sm:text-xs font-bold text-center px-0.5">{chapterLabel}</span>
              )}
            </div>

            {/* Title + TOC */}
            <details className="group w-full" aria-label={translations.expandChapter}>
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer">
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0 sm:pt-1">
                    <div className="text-xs sm:text-sm text-red-600 font-normal mb-0.5 sm:mb-1">{chapterLabel}</div>
                    <h3 className="text-sm sm:text-lg font-semibold text-black leading-snug">{title}</h3>
                    {subtitle && <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-0.5 sm:mt-1">{subtitle}</p>}
                  </div>
                  <div className="shrink-0 mt-1 sm:mt-5">
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-black transition-transform duration-200 group-open:rotate-180" />
                  </div>
                </div>
              </summary>
              <div className="mt-2 sm:mt-3">{renderTocItems(tableOfContents)}</div>
            </details>
          </div>

          {/* Continue / Coming Soon button */}
          <div className="md:flex-none flex justify-end shrink-0 mt-5">
            {released ? (
              <Link
                href={continueHref}
                className="border border-red-600 text-red-600 bg-white hover:bg-red-50 px-4 py-1.5 sm:px-8 sm:py-2.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
              >
                {translations.continue}
              </Link>
            ) : (
              <span className="border border-gray-300 text-gray-400 bg-gray-50 px-4 py-1.5 sm:px-8 sm:py-2.5 rounded text-xs sm:text-sm font-medium whitespace-nowrap cursor-default">
                {translations.comingSoon}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
