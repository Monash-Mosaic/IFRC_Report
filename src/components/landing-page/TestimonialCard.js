import { CircleUserIcon } from 'lucide-react';

export default function TestimonialCard({ quote }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full border border-gray-200">
      {/* Author Info */}
      <div className="flex items-center space-x-3 mt-auto">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <CircleUserIcon size={40} className="stroke-[1.5] bg-white text-red-600"></CircleUserIcon>
        </div>
      </div>
      {/* Quote */}
      <blockquote className="text-gray-800 leading-relaxed mb-6 mt-6">
        &quot;{quote}&quot;
      </blockquote>
    </div>
  );
}
