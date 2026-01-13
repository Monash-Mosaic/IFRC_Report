'use client';
// components/landing-page/HeroSection.js
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Share } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Download } from 'lucide-react';

// Dynamically import ReactPlayer (client-only, no SSR)
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function HeroSection({ messages }) {
  const reportDownloadLink = `https://www.dfat.gov.au/sites/default/files/vic-cef.pdf`;
  const [videoReady, setVideoReady] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('/wdr25/hero/hls/master.m3u8');

  // Network-based conditional loading
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const saveData = !!connection.saveData;
        const downlink = connection.downlink; // Mbps

        // Priority 1: Check saveData flag (data saver mode)
        if (saveData) {
          setPlaylistUrl('/wdr25/hero/hls/save_data.m3u8');
          return;
        }

        // Priority 2: Check effectiveType for 2G/slow-2G
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          setPlaylistUrl('/wdr25/hero/hls/2g.m3u8');
          return;
        }

        // Priority 3: Check effectiveType for 3G
        if (effectiveType === '3g') {
          setPlaylistUrl('/wdr25/hero/hls/3g.m3u8');
          return;
        }

        // Priority 4: Check effectiveType for 4G with downlink bandwidth
        if (effectiveType === '4g') {
          if (downlink && downlink < 1.5) {
            // Low 4G (less than 1.5 Mbps)
            setPlaylistUrl('/wdr25/hero/hls/low4g.m3u8');
          } else {
            // Full 4G (1.5 Mbps or higher)
            setPlaylistUrl('/wdr25/hero/hls/4g.m3u8');
          }
          return;
        }
      }
    }
    // Default: Use master playlist (full ABR) if Network API unavailable or unknown connection
  }, []);

  const HeroImage = () => {
    return (
      <Image
        src="/wdr25/hero/poster.jpg"
        alt={messages.heroAlt}
        fill
        priority
        sizes="100vw"
        className={`object-cover object-center transition-opacity duration-500 z-10`}
      />
    );
  };

  return (
    <section className=" space-y-8">
      <div className="relative pt-8 pb-8 px-4 md:px-20 overflow-hidden rounded-lg min-h-[500px] md:min-h-[600px] ">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Poster image - shown immediately, fades out when video is ready */}
          {!videoReady && <HeroImage />}
          <div className={`w-full h-full overflow-hidden`} >
            <ReactPlayer
                src={playlistUrl}
                playing
                loop
                muted
                disableRemotePlayback
                pip={false}
                preload="auto"
                playsInline
                style={{ height: '100%', width: 'auto' }}
                onPlaying={() => setVideoReady(true)}
              />
          </div>
          <div className="absolute inset-0 bg-black/30 z-20" />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl/18  font-bold text-white leading-tight text-end">
              <span className="whitespace-pre-line">{messages.title}</span>
              <div className="mt-8">2026</div>
            </h1>
            <div className="text-4xl md:text-5xl text-white leading-tight font-bold">
              <span className="whitespace-pre-line">{messages.description}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Responsive Layout Container */}
      <div className="flex flex-col gap-8">
        {/* Action Buttons - will reorder based on screen size */}
        <div className="order-2 md:order-1 flex flex-row gap-2 md:gap-4">
          <Link
            href="/reports/wdr25"
            className="flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap"
          >
            <span className="text-xs font-bold md:text-base">{messages.buttonTexts.read}</span>
            <Eye className="w-3 h-3 font-bold md:w-5 md:h-5 flex-shrink-0" />
          </Link>

          <div className="flex-1 md:flex-none">
            <a
              href={reportDownloadLink}
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

          <button className="w-12 md:w-auto px-2 md:px-6 py-2 md:py-3 text-red-600 font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap border-2 border-red-600 rounded-lg md:border-none md:underline">
            <span className="hidden md:inline text-xs md:text-base">
              {messages.buttonTexts.share}
            </span>
            <Share className="w-4 h-4 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
