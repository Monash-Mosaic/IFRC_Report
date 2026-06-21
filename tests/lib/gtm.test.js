import { sendGAEvent } from '@next/third-parties/google';
import {
  trackShare,
  trackTextHighlight,
  trackOutboundClick,
  trackPdfDownload,
  trackScrollDepth,
  trackLocaleSwitch,
  trackVideoPlay,
  trackFormSubmit,
  trackTocClick,
  trackNavClick,
} from '@/lib/gtm';

describe('gtm tracking helpers', () => {
  beforeEach(() => {
    sendGAEvent.mockClear();
  });

  it('tracks share events', () => {
    trackShare({ platform: 'twitter', url: 'https://example.com', text: 'Hello world' });
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'share', {
      platform_name: 'twitter',
      share_url: 'https://example.com',
      shared_text: 'Hello world',
    });
  });

  it('tracks text highlight events', () => {
    trackTextHighlight({ text: 'highlighted', url: '/chapter', color: 'yellow' });
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'text_highlight', {
      highlight_text: 'highlighted',
      highlight_url: '/chapter',
      highlight_color: 'yellow',
    });
  });

  it('tracks outbound, pdf, scroll, locale, video, form, toc, and nav events', () => {
    trackOutboundClick({ url: 'https://external.com', originSection: 'footer' });
    trackPdfDownload({ url: '/file.pdf', chapter: 'ch1', language: 'en' });
    trackScrollDepth({ depth: 50, url: '/page' });
    trackLocaleSwitch({ fromLocale: 'en', toLocale: 'fr', url: '/fr/page' });
    trackVideoPlay({ title: 'Intro', url: 'https://video.com' });
    trackFormSubmit({ formName: 'subscribe', url: '/subscribe' });
    trackTocClick({ heading: 'Section 1', chapterUrl: '/chapter' });
    trackNavClick({ linkText: 'Home', linkUrl: '/', section: 'header' });

    expect(sendGAEvent).toHaveBeenCalledTimes(8);
  });
});
