'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { getPathname, usePathname } from '@/i18n/navigation';
import Form from 'next/form';
import { useFormStatus } from 'react-dom'
 
export function SearchButton({ label }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      aria-label={label}
      disabled={status.pending}
      className="absolute start-3 top-1/2 transform -translate-y-1/2"
    >
      {status.pending ? (
        <span
          className="block w-5 h-5 rounded-full border-2 border-red-600 border-t-transparent animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Search className="w-5 h-5 text-red-600" />
      )}
    </button>
  );
}

export default function SearchInput() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const searchInputId = useId();
  const triggerInputId = `${searchInputId}-trigger`;
  const overlayInputId = `${searchInputId}-overlay`;
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(() => {
    if (isSearchPage) return true;
    return !!searchParams.get('q');
  });
  const isOverlayVisible = isSearchPage || isSearchOverlayOpen;
  const t = useTranslations('Home');
  const searchPlaceholder = t('nav.searchPlaceholder');

  // Get the localized search pathname (includes locale prefix e.g. /en/search)
  const searchAction = getPathname({
    locale,
    href: '/search',
  });

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearchInput = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const openSearchOverlay = () => {
    setIsSearchOverlayOpen(true);
  };

  const closeSearchOverlay = () => {
    setIsSearchOverlayOpen(false);
  };

  const handleOverlayBlur = (event) => {
    if (isSearchPage) {
      return;
    }
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeSearchOverlay();
    }
  };

  const handleSearchSubmit = (event) => {
    if (!searchQuery.trim()) {
      event.preventDefault();
      searchInputRef.current?.focus();
      return;
    }

    if (!isSearchPage) {
      closeSearchOverlay();
    }
  };

  useEffect(() => {
    if (!isOverlayVisible) {
      return;
    }
    searchInputRef.current?.focus();
  }, [isOverlayVisible]);

  useEffect(() => {
    if (!isOverlayVisible) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (isSearchPage) {
          return;
        }
        setIsSearchOverlayOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOverlayVisible, isSearchPage]);

  return (
    <>
      <div className="relative flex items-center gap-2">
        <label htmlFor={triggerInputId} className="sr-only">
          {t('nav.search')}
        </label>
        <input
          id={triggerInputId}
          type="search"
          value={searchQuery}
          onFocus={openSearchOverlay}
          placeholder={searchPlaceholder}
          className="border-2 border-red-600 text-red-600 rounded-lg font-medium w-10 lg:w-[20rem] lg:pe-4 ps-10 py-2 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          readOnly
        />
        <button
          type="button"
          onClick={openSearchOverlay}
          className="absolute start-3 top-1/2 transform -translate-y-1/2"
          aria-label={t('nav.search')}
        >
          <Search className="w-5 h-5 text-red-600" />
        </button>
      </div>

      {isOverlayVisible && (
        <div className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div
            className="max-w-9/10 lg:max-w-8/10 mx-auto lg:px-4 py-4 flex items-center h-[100px]"
            onBlur={handleOverlayBlur}
          >
            <Form
              action={searchAction}
              role="search"
              replace
              className="relative flex-1"
              onSubmit={handleSearchSubmit}
            >
              <input type="hidden" name="limit" defaultValue={10} />
              <label htmlFor={overlayInputId} className="sr-only">
                {t('nav.search')}
              </label>
              <input
                ref={searchInputRef}
                id={overlayInputId}
                type="search"
                name="q"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={searchPlaceholder}
                className="w-full ps-10 pe-20 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-300 bg-white placeholder-red-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                required
                autoComplete="off"
                spellCheck="true"
              />
              <SearchButton label={t('nav.search')} />
              <button
                type="button"
                onClick={clearSearchInput}
                className="absolute end-3 top-1/2 transform -translate-y-1/2"
                aria-label="Clear search input"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </Form>
            <button
              type="button"
              onClick={closeSearchOverlay}
              className="shrink-0 p-2 text-red-600 hover:text-red-700 transition-colors"
              aria-label={t('nav.search')}
            >
              <ArrowRight className="w-5 h-5 text-red-600 rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
