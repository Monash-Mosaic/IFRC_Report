'use client';
import { useRef, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getPathname } from '@/i18n/navigation';
import Form from 'next/form';

export default function SearchInput({
  isMobile = false,
  isSearchExpanded,
  setIsSearchExpanded,
  initialQuery = '',
}) {
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const t = useTranslations('Home');
  const locale = useLocale();

  // Update searchQuery when initialQuery changes (e.g., on search results page)
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Get the localized search pathname (includes locale prefix e.g. /en/search)
  const searchAction = getPathname({
    locale,
    href: '/search',
  });

  const iconClasses = 'w-5 h-5 text-red-600';

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
    const timeoutId = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      clearTimeout(timeoutId);
    }, 0);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery(initialQuery || '');
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle blur - close search when clicking outside
  const handleBlur = () => {
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
    }, 150);
  };

  // Mobile: Use CSS overlay approach
  if (isMobile) {
    return (
      <>
        {/* Search trigger button */}
        <button
          type="button"
          onClick={handleSearchFocus}
          className="w-10 h-10 flex items-center justify-center border-2 border-red-600 rounded-lg bg-white"
          aria-label={t('nav.search')}
        >
          <Search className="w-4 h-4 text-red-600" />
        </button>

        {/* Overlay search form */}
        {isSearchExpanded && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <Form action={searchAction} role="search" className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="search"
                  name="q"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder={t('nav.search')}
                  className="w-full pl-10 pr-4 py-2 h-10 border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-0 bg-white placeholder-red-400"
                  required
                  autoComplete="off"
                  spellCheck="true"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-600" />
              </Form>
              <button
                type="button"
                onClick={handleCloseSearch}
                className="p-2"
                aria-label="Close search"
              >
                <X
                  className={`${iconClasses} cursor-pointer hover:text-red-700 transition-colors`}
                />
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop: Original inline expansion behavior
  const containerClasses = `flex items-center ${isSearchExpanded ? 'w-full gap-3' : ''}`;

  const getSearchInputClasses = () => {
    const baseClasses =
      'border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-300 bg-white placeholder-red-400 transition-all duration-300 ease-in-out [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden';

    const sizeClasses = isSearchExpanded ? 'w-full pl-4 pr-12 py-2' : 'w-auto px-4 py-2 pr-10';

    return `${sizeClasses} ${baseClasses}`;
  };

  return (
    <div ref={containerRef} className={containerClasses}>
      <Form
        action={searchAction}
        role="search"
        className={`relative ${isSearchExpanded ? 'flex-1' : ''}`}
      >
        <input
          ref={searchInputRef}
          type="search"
          name="q"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={isSearchExpanded ? '' : t('nav.search')}
          onFocus={handleSearchFocus}
          onBlur={handleBlur}
          className={getSearchInputClasses()}
          required
          autoComplete="off"
          spellCheck="true"
        />
        {isSearchExpanded ? (
          <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className={iconClasses} />
          </button>
        ) : (
          <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-red-600" />
          </button>
        )}
      </Form>
      {isSearchExpanded && (
        <X
          className={`${iconClasses} cursor-pointer hover:text-red-700 transition-colors flex-shrink-0`}
          onClick={handleCloseSearch}
        />
      )}
    </div>
  );
}
