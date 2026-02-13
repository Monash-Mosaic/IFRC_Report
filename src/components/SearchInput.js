'use client';
import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SearchInput({ isMobile = false, isSearchExpanded, setIsSearchExpanded }) {
  const searchInputRef = useRef(null);
  const t = useTranslations('Home');

  const iconClasses = 'w-5 h-5 text-red-600';
  const containerClasses = `flex items-center ${
    isMobile && isSearchExpanded ? 'flex-1' : !isMobile && isSearchExpanded ? 'w-full' : ''
  } ${isSearchExpanded ? 'gap-3' : ''}`;

  // Utility function for conditional classes
  const getSearchInputClasses = (isMobile, isSearchExpanded) => {
    const baseClasses =
      'border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-0 bg-white placeholder-red-400';

    const sizeClasses = isMobile
      ? isSearchExpanded
        ? 'w-full pl-12 pr-12 py-2 h-10'
        : 'w-10 h-10 p-0 pr-0'
      : isSearchExpanded
        ? 'w-full pl-12 pr-4 py-2'
        : 'w-auto px-4 py-2 pr-10';

    const searchTransition = 'transition-all duration-300 ease-in-out';

    return `${sizeClasses} ${baseClasses} ${searchTransition}`;
  };

  const searchIconClasses = `absolute ${
    isMobile ? 'right-3 w-4 h-4 pointer-events-none' : 'right-3 w-5 h-5'
  } top-1/2 transform -translate-y-1/2 text-red-600`;

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
    // Ensure focus remains on the input after expansion
   const timeoutId = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      clearTimeout(timeoutId);
    }, 0);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
  };

  return (
    <div className={containerClasses}>
      <div
        className={`relative ${
          isMobile && isSearchExpanded ? 'flex-1' : !isMobile && isSearchExpanded ? 'flex-1' : ''
        }`}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder={isSearchExpanded ? '' : isMobile ? '' : t('nav.search')}
          onFocus={handleSearchFocus}
          className={getSearchInputClasses(isMobile, isSearchExpanded)}
        />
        {isSearchExpanded ? (
          <>
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconClasses}`}
            />
          </>
        ) : (
          <Search className={searchIconClasses} />
        )}
      </div>
      {isSearchExpanded && (
        <X
          className={`${iconClasses} cursor-pointer hover:text-red-700 transition-colors flex-shrink-0`}
          onClick={handleCloseSearch}
        />
      )}
    </div>
  );
}
