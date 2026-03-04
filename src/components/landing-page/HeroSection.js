'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Share } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Download } from 'lucide-react';
import HeroMediaBlock from './HeroMediaBlock';
import { isRtlLocale } from '@/i18n/helper';
import {
  FacebookShareButton,
  LinkedinShareButton,
} from 'next-share';

const CLOSE_BG = 'rgba(251,208,211,0.53)';

function normalizeNewlines(s) {
  return String(s ?? '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
}

function shareToWhatsApp({ url, text, separator }) {
  const sep = normalizeNewlines(separator || '\n');
  const message = `${text}${sep}${url}`.trim();
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(wa, '_blank', 'noopener,noreferrer');
}

/** Close icon – Figma 301-180 gg:close-r, 301-177. Uses exact Figma asset with SVG fallback. */
function GgCloseR({ className = '', ...props }) {
  return (
    <div
      className={`relative w-full h-full flex-shrink-0 ${className}`}
      data-name="gg:close-r"
      data-node-id="301:180"
      {...props}
    >
      <div className="absolute inset-[4.17%]" data-name="Group" data-node-id="301:177">
        <img
          alt=""
          src="/square-x.svg"
          className="absolute block w-full h-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}

async function copyShareLink({ url }) {
  if (typeof window === 'undefined') return;
  const shareUrl = url || window.location.href;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }
  } catch {
    // fall through to textarea fallback
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = shareUrl;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {
    // ignore copy failures
  }
}

function ShareActionIcon({ src }) {
  return <img alt="" src={src} className="block w-full h-full object-contain" draggable={false} />;
}

function ShareActionItem({ action, className, style }) {
  const hoverClasses = 'rounded-full hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-150';

  if (action.Wrapper) {
    return (
      <div className={`${action.sizeClass} ${hoverClasses} ${className ?? ''}`} style={style}>
        <action.Wrapper
          {...action.wrapperProps}
          className="w-full h-full inline-flex items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          <ShareActionIcon src={action.icon} />
        </action.Wrapper>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={`${action.sizeClass} ${hoverClasses} inline-flex items-center justify-center ${className ?? ''}`}
      style={style}
      title={action.label}
      aria-label={action.label}
    >
      <ShareActionIcon src={action.icon} />
    </button>
  );
}

export default function HeroSection({ locale = 'en', messages }) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareContainerRef = useRef(null);

  const getShareUrl = () =>
    typeof window !== 'undefined' ? window.location.href : '';

  const shareTitle = messages?.title;
  const isRtl = isRtlLocale(locale);

  const handleShareToggle = () => {
    setIsShareOpen((open) => !open);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (shareContainerRef.current && !shareContainerRef.current.contains(e.target)) {
        setIsShareOpen(false);
      }
    }
    if (isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareOpen]);

  const closeShare = () => setIsShareOpen(false);

  const shareActions = [
    {
      key: 'copy',
      icon: '/link.svg',
      sizeClass: 'w-[30px] h-[30px]',
      label: messages.buttonTexts.copyLink,
      desktopOffset: 97,
      desktopTop: 22,
      onClick: () => {
        copyShareLink({ url: getShareUrl() });
        closeShare();
      },
    },
    {
      key: 'linkedin',
      icon: '/linkedin.svg',
      sizeClass: 'w-[30px] h-[30px]',
      label: messages.buttonTexts.shareLinkedIn,
      desktopOffset: 148,
      desktopTop: 22,
      Wrapper: LinkedinShareButton,
      wrapperProps: { url: getShareUrl(), title: shareTitle, summary: shareTitle, onClick: closeShare },
    },
    {
      key: 'facebook',
      icon: '/facebook.svg',
      sizeClass: 'w-[35px] h-[35px]',
      label: messages.buttonTexts.shareFacebook,
      desktopOffset: 199,
      desktopTop: 19,
      Wrapper: FacebookShareButton,
      wrapperProps: { url: getShareUrl(), hashtag: '#IFRC', onClick: closeShare },
    },
    {
      key: 'whatsapp',
      icon: '/whatsapp.svg',
      sizeClass: 'w-[35px] h-[35px]',
      label: messages.buttonTexts.shareWhatsApp,
      desktopOffset: 255,
      desktopTop: 20,
      onClick: () => {
        shareToWhatsApp({ url: getShareUrl(), text: shareTitle, separator: '\n' });
        closeShare();
      },
    },
  ];

  return (
    <section className="space-y-8">
      <HeroMediaBlock
        title={messages.title}
        description={messages.description}
        heroAlt={messages.heroAlt}
      />
      {/* Responsive Layout Container */}
      <div className="flex flex-col gap-8">
        {/* Action Buttons - will reorder based on screen size */}
        <div className="order-2 md:order-1 flex flex-row gap-2 md:gap-4">
          <Link
            href={messages.url}
            className="flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap"
          >
            <span className="text-xs font-bold md:text-base">{messages.buttonTexts.read}</span>
            <Eye className="w-3 h-3 font-bold md:w-5 md:h-5 flex-shrink-0" />
          </Link>

          <div className="flex-1 md:flex-none">
            <a
              href={messages.downloadLink}
              alt="alt text"
              target="_blank"
              className="w-full h-full px-3 md:px-6 py-2 md:py-3 border-2 border-red-600 text-red-600 bg-[] hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap focus:outline-none"
              rel="noopener noreferrer"
            >
              <span className="text-xs font-bold md:text-base">
                {messages.buttonTexts.download}
              </span>
              <Download className="w-3 h-3 font-bold md:w-5 md:h-5 flex-shrink-0" />
            </a>
          </div>

          <div className="relative flex-none" ref={shareContainerRef}>
            <button
              type="button"
              onClick={handleShareToggle}
              className="p-[6px] border-3 border-[#ee2435] rounded-[8px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] bg-white inline-flex items-center justify-center hover:bg-[#EE2435] hover:text-white group transition-colors cursor-pointer md:w-[173px] md:h-[76px] md:p-0 md:border-2 md:shadow-sm md:gap-3"
              aria-expanded={isShareOpen}
              aria-label={messages.buttonTexts.share}
            >
              <span
                className="hidden md:inline underline decoration-solid underline-offset-auto text-[#EE2435] group-hover:text-white transition-colors truncate max-w-[110px] font-['Inter',sans-serif] text-lg font-medium leading-[150%]"
              >
                {messages.buttonTexts.share}
              </span>
              <Share className="w-[30px] h-[30px] shrink-0 text-[#EE2435] group-hover:text-white transition-colors" strokeWidth={2} />
            </button>

            {isShareOpen && (
              <div
                className={`absolute bottom-[calc(100%+12px)] z-40 w-[316px] ${isRtl ? 'left-0' : 'right-0'}`}
                role="menu"
              >
                <div className="relative w-full min-h-[76px] bg-white rounded-[8px] border-2 border-red-600 overflow-hidden shadow-lg">
                  <button
                    type="button"
                    onClick={() => setIsShareOpen(false)}
                    className={`absolute top-0 w-[76px] h-[76px] hover:brightness-95 active:brightness-90 transition-all duration-150 ${isRtl ? 'right-0 rounded-r-[8px]' : 'left-0 rounded-l-[8px]'}`}
                    style={{ backgroundColor: CLOSE_BG }}
                    aria-label={messages.buttonTexts.closeShare}
                  >
                    <span className="absolute" style={{ left: 21, top: 20, width: 35, height: 35 }}>
                      <GgCloseR />
                    </span>
                  </button>

                  {shareActions.map((action) => (
                    <ShareActionItem
                      key={action.key}
                      action={action}
                      className="absolute"
                      style={{
                        top: action.desktopTop,
                        [isRtl ? 'right' : 'left']: action.desktopOffset,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
