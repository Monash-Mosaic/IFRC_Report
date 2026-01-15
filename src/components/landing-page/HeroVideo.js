'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function HeroVideo({ alt }) {
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
      {/* Poster image - shown until video is ready */}
      {!videoReady && (
        <Image
          src="/wdr25/hero/poster.jpg"
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-opacity duration-500 z-10"
        />
      )}

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
