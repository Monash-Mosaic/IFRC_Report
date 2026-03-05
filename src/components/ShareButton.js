'use client';

import { Share } from 'lucide-react';
import { trackShare } from '@/lib/gtm';

export default function ShareButton({ label, url, title }) {
  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    trackShare({ platform: 'web_share', url: shareUrl, text: title || '' });

    try {
      if (navigator.share) {
        await navigator.share({ title: title || '', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // user cancelled or unsupported
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-12 md:w-auto px-2 md:px-6 py-2 md:py-3 text-red-600 font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap border-2 border-red-600 rounded-lg md:border-none md:underline"
    >
      <span className="hidden md:inline text-xs md:text-base">{label}</span>
      <Share className="w-4 h-4 md:w-4 md:h-4" />
    </button>
  );
}
