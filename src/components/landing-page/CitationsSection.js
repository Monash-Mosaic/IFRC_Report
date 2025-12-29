'use client';

// components/world-disasters/CitationsSection.js
import { useState, useRef, useEffect } from 'react';

function TestimonialCard({ quote, name, country }) {
  // Generate a color based on the name for consistent avatar colors
  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-gray-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const avatarColor = getAvatarColor(name);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-72 min-w-72 max-w-sm">
      {/* Quote */}
      <blockquote className="text-gray-800 leading-relaxed mb-6">{quote}</blockquote>

      {/* Author Info */}
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white text-sm font-medium">{initials}</span>
        </div>

        {/* Name and Country */}
        <div>
          <div className="font-medium text-gray-900 text-sm">{name}</div>
          <div className="text-gray-600 text-sm">{country}</div>
        </div>
      </div>
    </div>
  );
}

export default function CitationsSection({ reportData }) {
  const { title, testimonialsList } = reportData.landingPage.testimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Check if arrows are needed based on content overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current && containerRef.current) {
        const scrollWidth = scrollContainerRef.current.scrollWidth;
        const clientWidth = containerRef.current.clientWidth;
        setShowArrows(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [testimonialsList]);

  const scrollToNext = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 288; // w-72 (288px)
      const gap = 24; // gap-6
      const scrollAmount = cardWidth + gap;

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });

      setCurrentIndex((prev) => Math.min(prev + 1, testimonialsList.length - 1));
    }
  };

  const scrollToPrev = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 288; // w-72 (288px)
      const gap = 24; // gap-6
      const scrollAmount = cardWidth + gap;

      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });

      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // Update currentIndex based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const cardWidth = 288 + 24; // card width + gap
        const newIndex = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(newIndex);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <section className="space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>

      <div className="relative" ref={containerRef}>
        {/* Left Arrow */}
        {showArrows && currentIndex > 0 && (
          <button
            onClick={scrollToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Testimonials Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {testimonialsList.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              quote={testimonial.quote}
              name={testimonial.name}
              country={testimonial.country}
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showArrows && currentIndex < testimonialsList.length - 1 && (
          <button
            onClick={scrollToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next testimonial"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Dots Indicator */}
      {showArrows && testimonialsList.length > 1 && (
        <div className="flex justify-center space-x-2">
          {testimonialsList.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const cardWidth = 288 + 24; // card width + gap
                const scrollPosition = index * cardWidth;
                scrollContainerRef.current?.scrollTo({
                  left: scrollPosition,
                  behavior: 'smooth',
                });
              }}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
