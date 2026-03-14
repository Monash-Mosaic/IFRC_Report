'use client';

export async function shareOrCopy({ title, text, url }) {
  if (typeof window === 'undefined') return false;

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title || '';
  const bodyText = text || shareTitle;

  try {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: bodyText,
        url: shareUrl,
      });
      return true;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    }
  } catch {
    // fall through to legacy copy fallback
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = shareUrl;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

