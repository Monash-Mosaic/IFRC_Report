'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isRtlLocale } from '@/i18n/helper';

function NavButton({ direction, onClick, disabled, locale, ariaLabel }) {
  const Icon = isRtlLocale(locale)
    ? direction === 'prev'
      ? ChevronRight
      : ChevronLeft
    : direction === 'prev'
      ? ChevronLeft
      : ChevronRight;
  const baseClasses =
    'w-10 h-10 rounded-full shadow-md border flex items-center justify-center transition-all duration-200 focus:outline-none';
  const enabledClasses = 'bg-red-100 hover:bg-red-200 border-red-200 cursor-pointer';
  const disabledClasses = 'bg-red-50 border-gray-200 cursor-not-allowed';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
      aria-label={ariaLabel}
    >
      <Icon className={`w-5 h-5 ${disabled ? 'text-red-200' : 'text-red-700'}`} />
    </button>
  );
}

export default function QuotesPagination({ locale, page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-2">
      <NavButton
        direction="prev"
        onClick={onPrev}
        disabled={page <= 0}
        locale={locale}
        ariaLabel="Previous page"
      />
      <NavButton
        direction="next"
        onClick={onNext}
        disabled={page >= totalPages - 1}
        locale={locale}
        ariaLabel="Next page"
      />
    </div>
  );
}
