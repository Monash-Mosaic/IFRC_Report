'use client';

import { useEffect } from 'react';
import { trackTocClick } from '@/lib/gtm';

export default function TocClickTracker() {
  useEffect(() => {
    const handleClick = (event) => {
      const tocLink = event.target?.closest?.('[data-ga-section="toc"] a[href^="#"]');
      if (!tocLink) return;

      trackTocClick({
        heading: tocLink.textContent?.trim(),
        chapterUrl: typeof window !== 'undefined' ? window.location.pathname : '',
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
