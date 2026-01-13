'use client';
// components/landing-page/HeroVideo.js
import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Client component for the hero background video
 * Handles network-based quality selection and renders the video element
 * 
 * @param {Object} props
 * @param {string} props.heroAlt - Alt text for the video fallback image
 * @returns {JSX.Element}
 */
export default function HeroVideo({ heroAlt }) {
  const [videoReady, setVideoReady] = useState(false);
  const [videoQuality, setVideoQuality] = useState('720p'); // Default quality

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
          setVideoQuality('240p');
          return;
        }

        // Priority 2: Check effectiveType for 2G/slow-2G
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          setVideoQuality('240p');
          return;
        }

        // Priority 3: Check effectiveType for 3G
        if (effectiveType === '3g') {
          setVideoQuality('480p');
          return;
        }

        // Priority 4: Check effectiveType for 4G with downlink bandwidth
        if (effectiveType === '4g') {
          if (downlink && downlink < 1.5) {
            // Low 4G (less than 1.5 Mbps)
            setVideoQuality('720p');
          } else {
            // Full 4G (1.5 Mbps or higher)
            setVideoQuality('1080p');
          }
          return;
        }
      }
    }
    // Default: Use 720p (balanced quality) if Network API unavailable or unknown connection
  }, []);

  return (
    <>
      {/* Poster image - shown until video is ready */}
      {!videoReady && (
        <Image
          src="/wdr25/hero/poster.jpg"
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-opacity duration-500 z-10"
        />
      )}
      
      {/* Background video player - native HTML video element */}
      <video
        src={`/wdr25/hero/mp4/${videoQuality}.mp4`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-center"
        style={{ height: '100%', width: 'auto' }}
        onPlaying={() => setVideoReady(true)}
      >
        {/* Fallback image if video fails to load */}
        <Image
          src="/wdr25/hero/poster.jpg"
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-opacity duration-500 z-10"
        />
      </video>
    </>
  );
}
