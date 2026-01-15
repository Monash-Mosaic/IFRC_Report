'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const HERO_POSTER_BLUR_DATA_URL =
  'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAABwAQCdASoQAAkAA4BaJbACdAF1AAD+8O872VgmO+GIE7A8zCl7SO3C/7Ar1nPhn+XoMqAA';

export default function HeroVideo({ alt }) {
  const [videoReady, setVideoReady] = useState(false);
  /** @type {React.RefObject<HTMLVideoElement>} */
  const videoRef = useRef(null);
  /** @type {React.RefObject<HTMLImageElement>} */
  const imageRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const image = imageRef.current;
    if (!video) return;
    // replace image with video poster when finished loading
    if (image && image.complete && video) {
      video.poster = image.src;
    }

    let hls;
    let cancelled = false;

    const attachHls = async () => {
      let selectedUrl = '/wdr25/hero/hls/master.m3u8';

      // Network-based conditional loading - only supported in Chrome. Otherwise, hls.js will decide the quality based on the network conditions.
      if (typeof navigator !== 'undefined') {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (connection) {
          const effectiveType = connection.effectiveType;
          const saveData = !!connection.saveData;
          const downlink = connection.downlink; // Mbps

          // Priority 1: Check saveData flag (data saver mode)
          if (saveData) {
            selectedUrl = '/wdr25/hero/hls/save_data.m3u8';
          } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            // Priority 2: Check effectiveType for 2G/slow-2G
            selectedUrl = '/wdr25/hero/hls/2g.m3u8';
          } else if (effectiveType === '3g') {
            // Priority 3: Check effectiveType for 3G
            selectedUrl = '/wdr25/hero/hls/3g.m3u8';
          } else if (effectiveType === '4g') {
            // Priority 4: Check effectiveType for 4G with downlink bandwidth
            if (downlink && downlink < 1.5) {
              selectedUrl = '/wdr25/hero/hls/low4g.m3u8';
            } else {
              selectedUrl = '/wdr25/hero/hls/4g.m3u8';
            }
          }
        }
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = selectedUrl;
        return;
      }

      const { default: Hls } = await import('hls.js/dist/hls.light.js');
      if (cancelled) return;

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(selectedUrl);
        hls.attachMedia(video);
      } else {
        video.src = selectedUrl; // TODO: Use mp4 or WebM video if HLS is not supported.
      }
    };

    attachHls();

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <>
      {/* Poster image - fades out when video is ready */}
      <Image
        ref={imageRef}
        src="/wdr25/hero/poster.webp"
        alt={alt}
        fill
        priority={true}
        fetchPriority="high"
        sizes="100vw"
        placeholder="blur"
        blurDataURL={HERO_POSTER_BLUR_DATA_URL}
        className={`object-cover object-center transition-opacity duration-500 z-10 ${
          videoReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Background video player - native HTML video element */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        aria-label={alt}
        role="img"
        className="w-full h-full object-cover object-center"
        onPlaying={() => setVideoReady(true)}
      />
    </>
  );
}
