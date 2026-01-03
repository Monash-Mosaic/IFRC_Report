'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({
  title,
  items = [],
  cardComponent: CardComponent,
  cardWidth = 288,
  gap = 24,
  showDots = true,
  showArrows = true,
  className = "",
  containerClassName = "",
  cardType = "default", // "video" or "testimonial" or "default"
  ...cardProps
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Calculate items per page and total pages
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Use a base calculation with the default cardWidth for desktop
        const itemsVisible = Math.floor(containerWidth / (cardWidth + gap));
        const actualItemsPerPage = Math.max(1, itemsVisible);
        
        setItemsPerPage(actualItemsPerPage);
        
        // Show controls if we have more items than can fit in one page
        setShowControls(items.length > actualItemsPerPage);
      }
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, [items.length, cardWidth, gap]);

  // Get responsive width classes based on card type
  const getCardWidthClasses = () => {
    if (cardType === "video") {
      return "w-80 sm:w-96 lg:w-[524px]"; // Mobile: 320px, SM: 384px, LG: 524px
    } else if (cardType === "testimonial") {
      return "w-72 sm:w-72"; // Mobile & up: 288px
    }
    return `w-[${cardWidth}px]`; // Default: use prop value
  };

  const cardWidthClasses = getCardWidthClasses();

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    goToPage(currentPage - 1);
  };

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const startIndex = currentPage * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className={`space-y-8 ${className}`}>
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
      )}

      <div className={`relative ${containerClassName}`} ref={containerRef}>
        {/* Items Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-hidden"
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id || startIndex + index}
              className={`flex-shrink-0 ${cardWidthClasses}`}
            >
              <CardComponent {...item} {...cardProps} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls with Page Dots */}
      {showControls && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          {/* Previous Arrow */}
          {showArrows && (
            <button
              onClick={canGoPrev ? goToPrevPage : undefined}
              disabled={!canGoPrev}
              className={`w-10 h-10 rounded-full shadow-md border flex items-center justify-center transition-all duration-200 focus:outline-none ${
                canGoPrev 
                  ? 'bg-red-100 hover:bg-red-200 border-red-200 cursor-pointer' 
                  : 'bg-red-50 border-gray-200 cursor-not-allowed'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className={`w-5 h-5 ${canGoPrev ? 'text-red-700' : 'text-red-200'}`} />
            </button>
          )}

          {/* Page Dots with Numbers */}
          {showDots && (
            <div className="flex items-center space-x-2">
              {(() => {
                const maxVisiblePages = 5;
                const pages = [];
                
                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total is small
                  for (let i = 0; i < totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Smart pagination logic
                  if (currentPage <= 2) {
                    // Show: 1 2 3 ... 100
                    pages.push(0, 1, 2);
                    if (totalPages > 3) {
                      pages.push('ellipsis1');
                      pages.push(totalPages - 1);
                    }
                  } else if (currentPage >= totalPages - 3) {
                    // Show: 1 ... 98 99 100
                    pages.push(0);
                    if (totalPages > 4) {
                      pages.push('ellipsis1');
                    }
                    pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
                  } else {
                    // Show: 1 ... 5 6 7 ... 100
                    pages.push(0);
                    pages.push('ellipsis1');
                    pages.push(currentPage - 1, currentPage, currentPage + 1);
                    pages.push('ellipsis2');
                    pages.push(totalPages - 1);
                  }
                }

                return pages.map((page, index) => {
                  if (typeof page === 'string') {
                    // Ellipsis
                    return (
                      <span key={page} className="text-red-400 px-2 text-sm">
                        ...
                      </span>
                    );
                  }
                  
                  // Page button
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 focus:outline-none ${
                        page === currentPage 
                          ? 'bg-red-100 text-red-800 shadow-md border-2 border-red-500' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                      }`}
                      aria-label={`Go to page ${page + 1} of ${totalPages}`}
                    >
                      {page + 1}
                    </button>
                  );
                });
              })()}
            </div>
          )}

          {/* Next Arrow */}
          {showArrows && (
            <button
              onClick={canGoNext ? goToNextPage : undefined}
              disabled={!canGoNext}
              className={`w-10 h-10 rounded-full shadow-md border flex items-center justify-center transition-all duration-200 focus:outline-none ${
                canGoNext 
                  ? 'bg-red-100 hover:bg-red-200 border-red-200 cursor-pointer' 
                  : 'bg-red-50 border-gray-200 cursor-not-allowed'
              }`}
              aria-label="Next page"
            >
              <ChevronRight className={`w-5 h-5 ${canGoNext ? 'text-red-700' : 'text-red-200'}`} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}