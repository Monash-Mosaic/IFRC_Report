import { extractYouTubeVideoId } from '@/utils/video_util';

export default function VideoCard({ title, description, url }) {
  const youtubeVideoId = extractYouTubeVideoId(url);
  const embedSrc = youtubeVideoId
    ? `https://www.youtube.com/embed/${youtubeVideoId}?rel=0`
    : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {embedSrc ? (
          <iframe
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            src={embedSrc}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          // Fallback to native HTML video for non-YouTube URLs
          <video className="absolute inset-0 h-full w-full object-cover" controls>
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
