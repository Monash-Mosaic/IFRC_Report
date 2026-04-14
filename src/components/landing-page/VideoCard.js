import { extractYouTubeVideoId } from '@/utils/video_util';
import { YouTubeEmbed } from '@next/third-parties/google';

export default function VideoCard({ title, description, url }) {
  const youtubeVideoId = extractYouTubeVideoId(url);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full min-w-0">
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {youtubeVideoId ? (
          <div
            className="absolute inset-0 [&>*]:!absolute [&>*]:!inset-0 [&>*]:!h-full [&>*]:!w-full [&_lite-youtube]:block [&_lite-youtube]:!h-full [&_lite-youtube]:!w-full [&_lite-youtube]:!max-w-none"
          >
            <YouTubeEmbed
              videoid={youtubeVideoId}
              params="rel=0"
              style="width:100%;height:100%"
            />
          </div>
        ) : (
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
