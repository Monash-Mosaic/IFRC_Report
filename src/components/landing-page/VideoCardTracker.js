'use client';

import { useRef, useCallback } from 'react';
import { trackVideoPlay } from '@/lib/gtm';

export default function VideoCardTracker({ title, url, children }) {
  const trackedRef = useRef(false);

  const handleClick = useCallback(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackVideoPlay({ title, url });
  }, [title, url]);

  return (
    <div onClick={handleClick} onKeyDown={handleClick}>
      {children}
    </div>
  );
}
