'use client';

import { Download } from 'lucide-react';
import { trackPdfDownload } from '@/lib/gtm';

export default function DownloadButton({ url, chapter, language, ariaLabel }) {
  const handleClick = () => {
    trackPdfDownload({ url, chapter, language });
  };

  return (
    <a
      href={url}
      download
      onClick={handleClick}
      className="text-gray-600 hover:text-red-600 transition-colors pe-2"
      aria-label={ariaLabel}
    >
      <Download className="w-5 h-5 sm:w-6 sm:h-6" />
    </a>
  );
}
