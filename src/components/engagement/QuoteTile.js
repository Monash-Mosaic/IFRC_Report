'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getChapterMeta, getQuoteChapterHref } from '@/lib/quoteChapters';
import { getIconsForHarm } from '@/lib/quoteHarmIcons';

export default function QuoteTile({ quote }) {
  const locale = useLocale();
  const chapterHref = getQuoteChapterHref(quote.chapter, locale);
  const { label: chapterLabel, title: chapterTitle, thumbnail, thumbnailOverlay } = getChapterMeta(
    quote.chapter
  );
  const tohItems = getIconsForHarm(quote.harm);
  const thumbnailBgClass = thumbnailOverlay === 'blue' ? 'bg-blue-500' : 'bg-red-500';
  const overlayClass = thumbnailOverlay === 'blue' ? 'bg-blue-500/30' : 'bg-red-500/30';

  const heading =
    chapterLabel && chapterTitle
      ? `${chapterLabel}: ${chapterTitle}`
      : chapterLabel || chapterTitle || '';

  return (
    <article className="flex gap-5 p-5 bg-white rounded-xl border-2 border-[#ee2435]">
      {/* Left: chapter image + harm icons */}
      <div className="flex flex-col gap-3 shrink-0 w-[88px] sm:w-[104px]">
        <div
          className={`relative w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rounded overflow-hidden ${thumbnailBgClass} flex items-center justify-center`}
        >
          {thumbnail ? (
            <>
              <Image
                src={thumbnail}
                alt={heading || 'Chapter'}
                fill
                className="object-cover"
                sizes="104px"
              />
              <div className={`absolute inset-0 ${overlayClass}`} />
            </>
          ) : (
            <span className="text-white text-[10px] font-bold text-center px-1">{chapterLabel}</span>
          )}
        </div>

        {tohItems.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            {tohItems.map((item, i) => {
              const Icon = item.Icon;
              const tooltipText = item.labels?.length ? item.labels.join(', ') : '';
              return (
                <div
                  key={i}
                  className="relative group flex items-center justify-center w-8 h-8 rounded-full bg-[#ee2435] cursor-help"
                  title={tooltipText}
                >
                  <Icon size={14} className="text-white" strokeWidth={1.8} />
                  {tooltipText && (
                    <span
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap"
                      role="tooltip"
                    >
                      {tooltipText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: heading, quote, open */}
      <div className="flex flex-col flex-1 min-w-0">
        {heading && (
          <h3 className="text-sm font-bold text-[#ee2435] leading-snug mb-2">{heading}</h3>
        )}
        <p className="text-sm text-slate-900 italic leading-relaxed flex-1">
          &ldquo;{quote.text}&rdquo;
        </p>
        {chapterHref && (
          <div className="flex justify-end mt-4">
            <Link
              href={chapterHref}
              className="px-4 py-1.5 text-sm font-medium text-[#ee2435] border border-[#ee2435] rounded-md hover:bg-red-50 transition-colors"
              aria-label={heading ? `Open ${heading}` : 'Open chapter'}
            >
              Open
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
