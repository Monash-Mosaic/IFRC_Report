'use client';

import { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AutoPlay from 'embla-carousel-autoplay';

// Constants
const GAP_SIZE = 24; // Match gap-6 class (24px)
const CALCULATION_DELAY = 100; // DOM ready delay
const MAX_VISIBLE_PAGES = 5; // Maximum dots to show

export default function EmblaCarousel({
  title,
  children,
  className = "",
  containerClassName = "",
  slideClassName = "",
  slideWidth = "auto",
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayDelay = 3000,
  loop = true,
  align = 'start'
}) {
  // State
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Embla setup
  const plugins = autoPlay ? [AutoPlay({ delay: autoPlayDelay })] : [];
  const [emblaRef, emblaApi] = useEmblaCarousel({ align, loop, slidesToScroll: 1 }, plugins);

  // Navigation callbacks
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  // Helper functions
  const calculateItemsPerPage = useCallback(() => {
    if (!emblaRef?.current) return;

    const containerElement = emblaRef.current.querySelector('.embla__viewport') || emblaRef.current;
    const containerWidth = containerElement.clientWidth;
    const totalChildren = Array.isArray(children) ? children.length : 1;

    if (slideWidth !== "auto" && slideWidth > 0) {
      const itemsVisible = Math.floor(containerWidth / (slideWidth + GAP_SIZE));
      const actualItemsPerPage = Math.max(1, itemsVisible);
      setItemsPerPage(actualItemsPerPage);
      setShowControls(totalChildren > actualItemsPerPage);
    } else {
      setItemsPerPage(1);
      setShowControls(totalChildren > 1);
    }
  }, [emblaRef, slideWidth, children]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  // Effects
  useEffect(() => {
    calculateItemsPerPage();
    const timer = setTimeout(calculateItemsPerPage, CALCULATION_DELAY);
    
    window.addEventListener('resize', calculateItemsPerPage);
    
    if (emblaApi) {
      emblaApi.on('init', calculateItemsPerPage);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateItemsPerPage);
      if (emblaApi) {
        emblaApi.off('init', calculateItemsPerPage);
      }
    };
  }, [calculateItemsPerPage, emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Computed values
  const totalChildren = Array.isArray(children) ? children.length : 1;
  const totalPages = itemsPerPage > 0 ? Math.ceil(totalChildren / itemsPerPage) : 1;
  const shouldShowControls = showControls || totalChildren > 1;
  const currentPage = Math.floor(selectedIndex / itemsPerPage);

  // Slide styles
  const getSlideStyles = () => ({
    width: slideWidth === "auto" ? "auto" : `${slideWidth}px`,
    minWidth: slideWidth === "auto" ? "auto" : `${slideWidth}px`
  });

  // Navigation helpers
  const renderNavigationButton = (direction, onClick, disabled, ariaLabel) => {
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
    const baseClasses = "w-10 h-10 rounded-full shadow-md border flex items-center justify-center transition-all duration-200 focus:outline-none";
    const enabledClasses = "bg-red-100 hover:bg-red-200 border-red-200 cursor-pointer";
    const disabledClasses = "bg-red-50 border-gray-200 cursor-not-allowed";
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
        aria-label={ariaLabel}
      >
        <Icon className={`w-5 h-5 ${disabled ? 'text-red-200' : 'text-red-700'}`} />
      </button>
    );
  };

  const generatePageNumbers = () => {
    const pages = [];
    
    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(0, 1, 2);
        if (totalPages > 3) {
          pages.push('ellipsis1', totalPages - 1);
        }
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        if (totalPages > 4) {
          pages.push('ellipsis1');
        }
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push(0, 'ellipsis1', currentPage - 1, currentPage, currentPage + 1, 'ellipsis2', totalPages - 1);
      }
    }
    
    return pages;
  };

  const renderPageDot = (page, index) => {
    if (typeof page === 'string') {
      return (
        <span key={page} className="text-red-400 px-2 text-sm">
          ...
        </span>
      );
    }
    
    const isActive = page === currentPage;
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 focus:outline-none";
    const activeClasses = "bg-red-100 text-red-800 shadow-md border-2 border-red-500";
    const inactiveClasses = "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100";
    
    return (
      <button
        key={page}
        onClick={() => scrollTo(page * itemsPerPage)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        aria-label={`Go to page ${page + 1} of ${totalPages}`}
      >
        {page + 1}
      </button>
    );
  };

  const renderSlide = (child, index) => (
    <div 
      key={index} 
      className={`flex-shrink-0 ${slideClassName}`}
      style={getSlideStyles()}
    >
      {child}
    </div>
  );

  return (
    <section className={`space-y-8 ${className}`}>
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
      )}

      <div className={`relative ${containerClassName}`}>
        <div className="overflow-hidden embla__viewport" ref={emblaRef}>
          <div className="flex gap-6">
            {Array.isArray(children) 
              ? children.map(renderSlide)
              : renderSlide(children, 0)
            }
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showArrows && shouldShowControls && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          {/* Previous Arrow */}
          {renderNavigationButton('prev', scrollPrev, prevBtnDisabled, 'Previous slide')}

          {/* Next Arrow */}
          {renderNavigationButton('next', scrollNext, nextBtnDisabled, 'Next slide')}
        </div>
      )}
    </section>
  );
}