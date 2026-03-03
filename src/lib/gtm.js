'use client';

import { sendGTMEvent, sendGAEvent } from '@next/third-parties/google';

function pushEvent(eventName, params) {
  if (typeof window === 'undefined') return;

  sendGAEvent('event', eventName, params);

  sendGTMEvent({ event: eventName, ...params });
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
