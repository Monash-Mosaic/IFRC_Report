'use client';

import { sendGAEvent } from '@next/third-parties/google';

function pushEvent(eventName, params) {
  if (typeof window === 'undefined') return;

  sendGAEvent('event', eventName, params);
}

export function trackShare({ platform, url, text }) {
  pushEvent('share', {
    platform_name: platform,
    share_url: url,
    shared_text: text?.slice(0, 200) || '',
  });
}

export function trackTextHighlight({ text, url, color }) {
  pushEvent('text_highlight', {
    highlight_text: text?.slice(0, 500) || '',
    highlight_url: url,
    highlight_color: color,
  });
}

export function trackOutboundClick({ url, originSection }) {
  pushEvent('outbound_click', {
    click_url: url,
    origin_section: originSection,
  });
}

export function trackPdfDownload({ url, chapter, language }) {
  pushEvent('file_download', {
    file_url: url,
    chapter: chapter || '',
    language: language || '',
  });
}

export function trackScrollDepth({ depth, url }) {
  pushEvent('scroll_depth', {
    scroll_percentage: depth,
    page_url: url,
  });
}

export function trackLocaleSwitch({ fromLocale, toLocale, url }) {
  pushEvent('locale_switch', {
    from_locale: fromLocale,
    to_locale: toLocale,
    page_url: url,
  });
}

export function trackVideoPlay({ title, url }) {
  pushEvent('video_play', {
    video_title: title,
    video_url: url,
  });
}

export function trackFormSubmit({ formName, url }) {
  pushEvent('form_submit', {
    form_name: formName,
    page_url: url,
  });
}

export function trackTocClick({ heading, chapterUrl }) {
  pushEvent('toc_click', {
    heading_text: heading?.slice(0, 200) || '',
    chapter_url: chapterUrl,
  });
}

export function trackNavClick({ linkText, linkUrl, section }) {
  pushEvent('nav_click', {
    link_text: linkText,
    link_url: linkUrl,
    nav_section: section,
  });
}
