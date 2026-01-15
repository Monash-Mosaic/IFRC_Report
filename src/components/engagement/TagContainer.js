import { ChevronDown, Funnel, Shuffle, Circle, CircleCheck } from 'lucide-react';
import { useState } from 'react';
export default function TagContainer({ selectedTag, setSelectedTag, handleSelectionTag }) {
  const [isShuffleTag, setIsShuffleTag] = useState(false);
  const tags = [
    {
      id: 'safety',
      label: 'Safety and security of staff and volunteers',
      type: 'harm_category',
    },
    {
      id: 'access_contstraints',
      label: 'Access constraints and acceptance risks',
      type: 'harm_category',
    },
    {
      id: 'programme',
      label: 'Programme effectiveness and accountability',
      type: 'harm_category',
    },
    {
      id: 'rumour_tracking',
      label: 'Rumour tracking and early warning',
      type: 'response_strategy',
    },
    {
      id: 'information_aid',
      label: 'Information as aid',
      type: 'response_strategy',
    },
    {
      id: 'trusted_messenger',
      label: 'Trusted messengers and local intermediaries',
      type: 'response_strategy',
    },
    {
      id: 'community_engagement',
      label: 'Community engagement and accountability',
      type: 'response_strategy',
    },
    {
      id: 'prebunking',
      type: 'response_strategy',
      label: 'Prebunking and narrative resilience',
    },
    {
      id: 'debunking',
      label: 'Debunking and corrective communication',
      type: 'response_strategy',
    },
    {
      id: 'principles',
      label: 'Humanitarian principles and neutrality',
      type: 'governance',
    },
    {
      id: 'freedom',
      label: 'Freedom of expression and information rights',
      type: 'governance',
    },
    {
      id: 'regulation',
      label: 'Regulation and public policy framework',
      type: 'governance',
    },
  ];

  const tag_combo = [
    { programme: true, regulation: true },
    { safety: true, access_contstraints: true },
  ];

  const handleShuffleTag = () => {
    if (!isShuffleTag) {
      const randomIndex = Math.floor(Math.random() * tag_combo.length);
      setSelectedTag(tag_combo[randomIndex]);
    } else {
      setSelectedTag({});
    }
    setIsShuffleTag(!isShuffleTag);
  };

  const [expandedTags, setExpandedTags] = useState(true);
  const toggleTag = () => {
    setExpandedTags(!expandedTags);
  };

  return (
    <div
      className="animate-fade-in bg-white rounded-xl border border-slate-200 shadow-sm"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="w-full h-15 flex justify-between items-center px-2 rounded-lg">
        {/* Left Side - Filter Label */}
        <div className="flex items-center gap-2">
          <Funnel size={20} className="text-[#ee2435]" />
          <span className="text-sm font-semibold text-slate-900">Explore Content By Tags</span>
        </div>

        {/* Right Side - Shuffle and Dropdown */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleShuffleTag()}
            className="hover:opacity-70 text-[#ee2435] transition-opacity"
          >
            <Shuffle size={20} className="hover:text-[#ee2435] text-stone-700" />
          </button>
          <button onClick={() => toggleTag()}>
            <ChevronDown
              size={20}
              className={`text-stone-500 transition-transform duration-300 ${
                !expandedTags ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Tags List - Centered with 60% width */}
      <div className="w-full flex justify-center">
        <div
          className={`w-full transition-all duration-300 ease-in-out overflow-hidden
          ${expandedTags ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex flex-wrap gap-3 justify-center p-4">
            {tags.map((tag, index) => (
              <button
                key={tag.id}
                onClick={() => handleSelectionTag(tag.id)}
                className={`
                tag-btn px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  selectedTag[tag.id]
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white border-2'
                    : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-red-300 hover:border-2'
                }
              `}
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <div className="flex items-center gap-2">
                  {selectedTag[tag.id] ? (
                    <CircleCheck size={18}></CircleCheck>
                  ) : (
                    <Circle size={18} className="text-stone-400"></Circle>
                  )}

                  {tag.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
