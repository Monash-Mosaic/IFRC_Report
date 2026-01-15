'use client';
import { useState } from 'react';
import { ChevronDown, X, BookOpen, BookText } from 'lucide-react';

import QuoteMap from '@/components/engagement/QuoteMap';
import SurveyInsight from '@/components/engagement/SurveyInsight';
import TagContainer from '@/components/engagement/TagContainer';
import CommunityResearchInsight from '@/components/engagement/CommunityResearchInsight';

export default function EngagementPage() {
  const [selectedTag, setSelectedTag] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});

  const chapters = [
    {
      id: 1,
      title:
        'Chapter 1. Crisis Chaos and Confusion: Understanding harmful information in humanitarian context',
      sections: [
        {
          title: 'Harmful Information and the DANA floods in Valencia (Spain) 2024 (Part 1) ',
          slug: 'what-is-misinformation',
          tags: ['safety', 'access_contstraints'],
        },
        {
          title:
            'South Sudan – impact of harmful information on humanitarian response (Rumours of poisoned food)',
          slug: 'types-of-false-info',
          tags: ['safety', 'access_contstraints', 'rumour_tracking'],
        },
        {
          title:
            'Impact of Harmful Information on Humanitarian Response (False rumours of armed youth)',
          slug: 'historical-context',
          tags: ['programme', 'rumour_tracking'],
        },
        {
          title: 'Building on UN norms for information integrity',
          slug: 'historical-context',
          tags: ['regulation'],
        },
      ],
    },
    {
      id: 2,
      title:
        'Chapter 2. Trust Perception and Harmful Information in Public Health and Crisis Response',
      sections: [
        {
          title: 'Trust, misinformation and the power of local connection in crisis response',
          slug: 'social-media-amplification',
          tags: ['access_contstraints', 'trusted_messenger', 'community_engagement', 'principles'],
        },
        {
          title: 'Earning trust in an age of accountability',
          slug: 'viral-mechanics',
          tags: ['programme', 'community_engagement', 'prebunking', 'principles'],
        },
        {
          title:
            'Addressing harmful information: Lebanese Red Cross experience in humanitarian crises',
          slug: 'echo-chambers',
          tags: [
            'access_contstraints',
            'safety',
            'rumour_tracking',
            'debunking',
            'information_aid',
            'principles',
          ],
        },
      ],
    },
  ];

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleSelectionTag = (tagID) => {
    setSelectedTag((prev) => ({
      ...prev,
      [tagID]: !prev[tagID],
    }));
  };

  // Filter your content based on both selectedTag and selectedStats
  const getFilteredChapter = () => {
    let filteredContent = chapters; // Your content array
    const chosenTags = Object.keys(selectedTag).filter((key) => selectedTag[key]);

    // Filter by tag if one is selected
    if (chosenTags.length != 0) {
      filteredContent.forEach((chapter) => {
        chapter.sections = chapter.sections.filter((section) =>
          chosenTags.every((tag) => section.tags.includes(tag))
        );
      });
    }

    return filteredContent.filter((chapter) => chapter.sections.length > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-neutral-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 sidebar-backdrop z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
        fixed top-0 left-0 h-screen w-100 bg-white shadow-2xl z-50
        transition-transform duration-300 ease-out overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-stone-200
      `}
      >
        <div className="p-6">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-6 p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={20} className="text-stone-600" />
          </button>

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
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-12 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-red-600">
                +
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold text-slate-900">IFRC</div>
                <div className="text-base text-slate-500">Harmful information</div>
              </div>
            </div>
          </div>

          <div className="text-right text-base text-slate-700 font-semibold leading-tight">
            <div>World</div>
            <div>Disasters</div>
            <div>Report</div>
            <div className="h-2"></div>
            <div className="text-slate-500">2026</div>
          </div>
        </div>
        <TagContainer
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          handleSelectionTag={handleSelectionTag}
        ></TagContainer>
        <SurveyInsight
          selectedTag={selectedTag}
          handleSelectionTag={handleSelectionTag}
        ></SurveyInsight>
        <QuoteMap selectedTag={selectedTag} handleSelectionTag={handleSelectionTag}></QuoteMap>
        <CommunityResearchInsight></CommunityResearchInsight>
      </main>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-8 left-8 p-4 bg-gradient-to-br from-red-600 to-orange-500
                   text-white rounded-full shadow-2xl shadow-red-500/40 z-30
                   hover:scale-110 active:scale-95 transition-transform duration-200"
        aria-label="Toggle sidebar"
      >
        <BookText size={24} />
      </button>
    </div>
  );
}
