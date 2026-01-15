'use client';
import { useState } from 'react';
<<<<<<< HEAD

import TagContainer from '@/components/engagement/TagContainer';
import QuotesSection from '@/components/engagement/QuotesSection';
=======
import {
  ChevronDown,
  X,
  BookOpen,
  BookText,
  Funnel,
  Shuffle,
  Circle,
  CircleCheck,
} from 'lucide-react';
>>>>>>> 608e85d (SurveyInsight)

import QuoteMap from '@/components/engagement/QuoteMap';
import SurveyInsight from '@/components/engagement/SurveyInsight';

export default function EngagementPage() {
  const [selectedTag, setSelectedTag] = useState({});
<<<<<<< HEAD
=======
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isShuffleTag, setIsShuffleTag] = useState(false);
  const [expandedTags, setExpandedTags] = useState(true);

  const tag_combo = [
    { erosion: true, safety: true },
    { erosion: true, rumour: true },
    { access: true, rumour: true },
    { safety: true, rumour: true },
  ];

  const tags = [
    {
      id: 'erosion_trust',
      label: 'Erosion of trust in humanitarian actors',
      type: 'harm_category',
    },
    {
      id: 'incitement_violence',
      label: 'Incitement to violence or social unrest',
      type: 'harm_category',
    },
    {
      id: 'life_threatening_misinfo',
      label: 'Life-threatening misinformation',
      type: 'harm_category',
    },
  ];

  const chapters = [
    {
      id: 1,
      title:
        'Chapter 1. Crisis Chaos and Confusion: Understanding harmful information in humanitarian context',
      sections: [
        {
          title: 'Defining Misinformation',
          slug: 'what-is-misinformation',
          tags: ['access', 'rumour', 'affected', 'dialogue'],
        },
        {
          title: 'Types of False Information',
          slug: 'types-of-false-info',
          tags: ['erosion', 'affected', 'dialogue'],
        },
        {
          title: 'Historical Context',
          slug: 'historical-context',
          tags: ['safety', 'combat', 'dialogue'],
        },
      ],
    },
    {
      id: 2,
      title:
        'Chapter 2. Trust Perception and Harmful Information in Public Health and Crisis Response',
      sections: [
        {
          title: 'Social Media Amplification',
          slug: 'social-media-amplification',
          tags: ['access', 'rumour', 'reject'],
        },
        {
          title: 'Viral Mechanics',
          slug: 'viral-mechanics',
          tags: ['access', 'rumour', 'affected'],
        },
        { title: 'Echo Chambers', slug: 'echo-chambers', tags: ['access', 'combat'] },
      ],
    },
  ];

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const toggleTag = () => {
    setExpandedTags(!expandedTags);
  };
>>>>>>> 608e85d (SurveyInsight)

  const handleSelectionTag = (tagID) => {
    setSelectedTag((prev) => ({
      ...prev,
      [tagID]: !prev[tagID],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="w-full overflow-hidden" style={{ height: '420px' }}>
        <img
          src="/engagement_page_picture.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

<<<<<<< HEAD
      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <TagContainer selectedTag={selectedTag} handleSelectionTag={handleSelectionTag} />
        <QuotesSection selectedTag={selectedTag} />
=======
          {/* Sidebar Header */}
          <div className="mb-6 animate-slide-in">
            <div className="flex justify-start gap-2 text-stone-800">
              <BookOpen size={30}></BookOpen>
              <h2 className="text-xl font-bold mb-2">Contributions Reading List</h2>
            </div>
            <div className="h-1 w-90 bg-gradient-to-r from-red-600 to-orange-500 rounded-full" />
          </div>
          <div className="ml-5 text-lg font-bold text-[#ee2435]">
            {getFilteredChapter().reduce((total, chapter) => total + chapter.sections.length, 0)}{' '}
            Contributions
          </div>
        </div>

        <nav className="space-y-3">
          {getFilteredChapter().map((chapter, index) => (
            <div
              key={chapter.id}
              className="chapter-item px-6 rounded-lg overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="px-6 py-3 h-20 flex items-center justify-between text-left border-1 rounded-lg border-stone-400"
              >
                <span className="text-sm font-semibold text-stone-800 flex-1 pr-2">
                  {chapter.title}
                </span>
                <span className="text-base font-semibold text-stone-400 pr-2">
                  {chapter.sections.length}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-stone-500 transition-transform duration-300 flex-shrink-0 ${
                    expandedChapters[chapter.id] ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Sections Dropdown */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${expandedChapters[chapter.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-4 pb-3 space-y-2 bg-stone-50/50">
                  {chapter.sections.map((section, sectionIndex) => (
                    <a
                      key={sectionIndex}
                      href={`/report/chapter-${String(chapter.id).padStart(2, '0')}#${section.slug}`}
                      className="section-link block py-2 text-sm text-stone-600 hover:text-red-600"
                      style={{ animationDelay: `${index * 0.05 + sectionIndex * 0.03}s` }}
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="lg:ml-150 min-h-screen px-4 max-w-[70%] sm:max-w-[100%] md:max-w-[100%] lg:max-w-[60%] bg-stone-50 pt-8 ">
        {/* Tags Filter Header*/}
        <div className="animate-fade-in " style={{ animationDelay: '0.1s' }}>
          <div className="w-full h-25 flex justify-between items-center px-2 rounded-lg border-2 border-stone-300 shadow-md">
            {/* Left Side - Filter Label */}
            <div className="flex items-center gap-2">
              <Funnel size={28} className="text-[#ee2435]" />
              <span className="text- font-bold text-stone-700 uppercase ">
                Explore Content By Tags
              </span>
            </div>

            {/* Right Side - Shuffle and Dropdown */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleShuffleTag()}
                className="hover:opacity-70 text-[#ee2435] transition-opacity"
              >
                <Shuffle size={28} className="hover:text-[#ee2435] text-stone-700" />
              </button>
              <button onClick={() => toggleTag()}>
                <ChevronDown
                  size={28}
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
                tag-btn px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200
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

        <SurveyInsight
          selectedTag={selectedTag}
          handleSelectionTag={handleSelectionTag}
        ></SurveyInsight>
        <QuoteMap></QuoteMap>
>>>>>>> 608e85d (SurveyInsight)
      </main>
    </div>
  );
}
