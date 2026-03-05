'use client';

import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/lib/gtm';

const THRESHOLDS = [25, 50, 75, 90];

export default function ScrollDepthTracker() {
  const firedRef = useRef(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);
      const url = window.location.pathname;

      for (const threshold of THRESHOLDS) {
        if (percent >= threshold && !firedRef.current.has(threshold)) {
          firedRef.current.add(threshold);
          trackScrollDepth({ depth: threshold, url });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
