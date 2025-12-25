'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

export default function ImageSlider({
  imagePath,
  alt = 'Alt',
  title = 'Title',
  width = 900,
  height = 700,
  overlayOpacity = 0.4,
  overlayColor = '#ee2435',
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Clamp between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(clampedPercentage);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-ew-resize select-none w-full rounded-lg"
        style={{
          maxWidth: width,
          aspectRatio: `${width} / ${height}`,
          margin: '0 auto',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* Right Layer: Image with Red Overlay */}
        <div className="absolute inset-0">
          <Image
            src={imagePath}
            alt={alt}
            title={title}
            fill
            className="object-cover"
            draggable={false}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
        </div>

        {/* Left Layer: Original Image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Image
            src={imagePath}
            alt={alt}
            title={title}
            fill
            className="object-cover"
            draggable={false}
            priority
          />
        </div>

        {/* Slider Line and Handle */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${sliderPosition}%`,
            opacity: isDragging ? 1 : 0.8,
          }}
        >
          {/* Vertical Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>
      </div>
    </div>
  );
}
