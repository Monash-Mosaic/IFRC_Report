'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Download } from 'lucide-react';
import HeroMediaBlock from './HeroMediaBlock';
import { isRtlLocale } from '@/i18n/helper';
import {
  FacebookShareButton,
  TwitterShareButton,
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
          src="/figma-close-301-180.svg"
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

export default function HeroSection({ locale = 'en', messages }) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const getShareUrl = () =>
    typeof window !== 'undefined' ? window.location.href : '';

  const shareTitle = messages?.title;
  const isRtl = isRtlLocale(locale);

  const handleShareToggle = () => {
    setIsShareOpen((open) => !open);
  };

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

          <div className="relative">
            <button
              type="button"
              onClick={handleShareToggle}
              className="w-[173px] h-[76px] bg-white rounded-[8px] inline-flex items-center justify-center gap-3 whitespace-nowrap shadow-sm hover:bg-[#EE2435] hover:text-white group transition-colors cursor-pointer"
              aria-expanded={isShareOpen}
              aria-label={messages.buttonTexts.share}
            >
              <span
                className="underline text-[#EE2435] group-hover:text-white transition-colors truncate max-w-[110px]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 18,
                  fontWeight: 500,
                  lineHeight: '150%',
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                  textUnderlineOffset: 'auto',
                }}
              >
                {messages.buttonTexts.share}
              </span>
              <Share className="w-[30px] h-[30px] shrink-0 text-[#EE2435] group-hover:text-white transition-colors" strokeWidth={2} />
            </button>

            {isShareOpen && (
              <div
                className={`absolute top-0 z-40 ${isRtl ? 'right-full mr-1' : 'left-full ml-1'}`}
              >
                {/* Share Button (expanded) – Figma 301-171: W316 × H76 */}
                <div className="relative w-[316px] h-[76px] bg-white rounded-[8px] overflow-hidden">
                  {/* Close tile – 76×76 */}
                  <button
                    type="button"
                    onClick={() => setIsShareOpen(false)}
                    className={`absolute top-0 w-[76px] h-[76px] hover:brightness-95 active:brightness-90 transition-all duration-150 ${isRtl ? 'right-0 rounded-r-[8px]' : 'left-0 rounded-l-[8px]'}`}
                    style={{ backgroundColor: CLOSE_BG }}
                    aria-label="Close share menu"
                  >
                    <span
                      className="absolute"
                      style={{ left: 21, top: 20, width: 35, height: 35 }}
                    >
                      <GgCloseR />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyShareLink({ url: getShareUrl() })}
                    className={`absolute top-[22px] w-[30px] h-[30px] inline-flex items-center justify-center rounded-full hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-150 ${isRtl ? 'right-[97px]' : 'left-[97px]'}`}
                    aria-label="Copy link"
                  >
                    <img
                      alt=""
                      src="/figma-link-301-189.svg"
                      className="block w-full h-full object-contain"
                      draggable={false}
                    />
                  </button>

                  <div className={`absolute top-[22px] w-[30px] h-[30px] rounded-full hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-150 ${isRtl ? 'right-[148px]' : 'left-[148px]'}`}>
                    <TwitterShareButton
                      url={getShareUrl()}
                      title={shareTitle}
                      className="w-full h-full inline-flex items-center justify-center"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <img
                        alt=""
                        src="/figma-twitter-301-197.svg"
                        className="block w-full h-full object-contain"
                        draggable={false}
                      />
                    </TwitterShareButton>
                  </div>

                  <div className={`absolute top-[19px] w-[35px] h-[35px] rounded-full hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-150 ${isRtl ? 'right-[199px]' : 'left-[199px]'}`}>
                    <FacebookShareButton
                      url={getShareUrl()}
                      hashtag="#IFRC"
                      className="w-full h-full inline-flex items-center justify-center"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <img
                        alt=""
                        src="/figma-facebook-301-200.svg"
                        className="block w-full h-full object-contain"
                        draggable={false}
                      />
                    </FacebookShareButton>
                  </div>

                  <div className={`absolute top-[20px] w-[35px] h-[35px] rounded-full hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-150 ${isRtl ? 'right-[255px]' : 'left-[255px]'}`}>
                    <button
                      type="button"
                      onClick={() => shareToWhatsApp({ url: getShareUrl(), text: shareTitle, separator: '\n' })}
                      className="w-full h-full inline-flex items-center justify-center"
                      title="Share to WhatsApp"
                      aria-label="Share to WhatsApp"
                    >
                      <img
                        alt=""
                        src="/figma-whatsapp-301-203.svg"
                        className="block w-full h-full object-contain"
                        draggable={false}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
