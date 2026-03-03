'use client';

import { sendGTMEvent } from '@next/third-parties/google';

function pushEvent(payload) {
  if (typeof window === 'undefined') return;
  sendGTMEvent(payload);
}

export function trackShare({ platform, url, text }) {
  pushEvent({
    event: 'share',
    platform_name: platform,
    share_url: url,
    shared_text: text?.slice(0, 200) || '',
  });
}

export function trackTextHighlight({ text, url, color }) {
  pushEvent({
    event: 'text_highlight',
    highlight_text: text?.slice(0, 500) || '',
    highlight_url: url,
    highlight_color: color,
  });
}

export function trackOutboundClick({ url, originSection }) {
  pushEvent({
    event: 'outbound_click',
    click_url: url,
    origin_section: originSection,
  });
}

export function trackPdfDownload({ url, chapter, language }) {
  pushEvent({
    event: 'file_download',
    file_url: url,
    chapter: chapter || '',
    language: language || '',
  });
}
