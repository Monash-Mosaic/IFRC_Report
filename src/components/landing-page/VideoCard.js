'use client';
import { extractYouTubeVideoId } from '@/utils/video_util';

import { YouTubeEmbed } from '@next/third-parties/google';
import { useTranslations } from 'next-intl';

// Helper function to extract YouTube video ID from URL

export default function VideoCard({ title, description, url }) {
  const t = useTranslations('Home.videoCard');
  const youtubeVideoId = extractYouTubeVideoId(url);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full">
      {/* YouTube Player */}
      <div className="relative aspect-video bg-gray-900">
        {youtubeVideoId ? (
          <YouTubeEmbed videoid={youtubeVideoId} params="autoplay=1&rel=0" />
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
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
