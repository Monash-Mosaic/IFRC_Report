'use client';

import { useEffect } from 'react';
import { trackOutboundClick, trackNavClick } from '@/lib/gtm';

export default function OutboundLinkTracker() {
  useEffect(() => {
    const handleClick = (event) => {
      const link = event.target?.closest?.('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const text = link.textContent?.trim()?.slice(0, 200) || '';
      const section = link.closest('[data-ga-section]')?.dataset?.gaSection || '';

      const isExternal =
        href.startsWith('http') && !href.includes(window.location.hostname);

      if (isExternal) {
        trackOutboundClick({ url: href, originSection: section });
      }

      const isNavLink = !!link.closest('header, nav, footer');
      if (isNavLink && !isExternal) {
        trackNavClick({ linkText: text, linkUrl: href, section: section || 'navigation' });
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
