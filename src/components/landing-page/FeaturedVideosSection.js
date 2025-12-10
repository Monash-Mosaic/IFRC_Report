"use client"

// components/landing-page/FeaturedVideosSection.js
import Image from 'next/image';
import { useState } from 'react';
import { YouTubeEmbed } from '@next/third-parties/google';

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Inline VideoCard component
function VideoCard({ title, description, thumbnailSrc, thumbnailAlt, url }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  if (isPlaying) {
    const youtubeVideoId = extractYouTubeVideoId(url);

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {/* YouTube Player */}
        <div className="relative aspect-video bg-gray-900">
          {youtubeVideoId ? (
            <YouTubeEmbed 
              videoid={youtubeVideoId} 
              params="autoplay=1&rel=0"
            />
          ) : (
            // Fallback to native HTML video for non-YouTube URLs
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              onEnded={() => setIsPlaying(false)}
            >
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
          <button 
            onClick={() => setIsPlaying(false)}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Back to thumbnail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200">
        <Image
          src={thumbnailSrc}
          alt={thumbnailAlt}
          fill
          className="object-cover"
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={handlePlayClick}
            className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Play video"
          >
            <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function FeaturedVideosSection({ reportData, locale = 'en' }) {
  const featuredVideosData = reportData.landingPage.featuredVideos;

  return (
    <section className="space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        {featuredVideosData.title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredVideosData.videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            description={video.description}
            thumbnailSrc={video.thumbnailSrc}
            thumbnailAlt={video.thumbnailAlt}
            url={video.url}
          />
        ))}
      </div>
    </section>
  );
}