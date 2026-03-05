'use client';

import { trackPdfDownload } from '@/lib/gtm';

export default function DownloadLink({ url, onClick = () => {}, chapter, language, ariaLabel, className, children, ...props }) {
  const handleClick = (e) => {
    trackPdfDownload({ url, chapter, language });
    onClick(e);
  };

  return (
    <a
      href={url}
      download
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </a>
  );
}
