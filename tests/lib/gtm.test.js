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

  it('applies default empty values for optional tracking fields', () => {
    trackShare({ platform: 'web', url: '/share' });
    trackTextHighlight({ url: '/chapter', color: 'yellow' });
    trackPdfDownload({ url: '/file.pdf' });
    trackTocClick({ chapterUrl: '/chapter' });

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'share', {
      platform_name: 'web',
      share_url: '/share',
      shared_text: '',
    });
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'text_highlight', {
      highlight_text: '',
      highlight_url: '/chapter',
      highlight_color: 'yellow',
    });
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'file_download', {
      file_url: '/file.pdf',
      chapter: '',
      language: '',
    });
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'toc_click', {
      heading_text: '',
      chapter_url: '/chapter',
    });
  });
});
