'use client';
import { useState } from 'react';
import {
  ChevronDown,
  Menu,
  X,
  BookOpen,
  BookText,
  Funnel,
  Shuffle,
  Circle,
  CircleCheck,
  Heart,
  AlertTriangle,
  Users,
  Shield,
  User,
} from 'lucide-react';

export default function EngagementPage() {
  const [selectedTag, setSelectedTag] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isShuffleTag, setIsShuffleTag] = useState(false);
  const [expandedTags, setExpandedTags] = useState(true);

  const tag_combo = [
    { erosion: true, safety: true },
    { access: true, rumour: true },
  ];

  const tags = [
    {
      id: 'erosion',
      label: 'Erosion of trust in humanitarian actors; Stigmatization and dehumanization',
    },
    { id: 'safety', label: 'Safety and security of staff and volunteers' },
    { id: 'debunking', label: 'Debunking and corrective communication' },
    { id: 'life-threat', label: 'Life-threatening Misinformation' },
    { id: 'access', label: 'Access constraints and acceptance risks' },
    { id: 'rumour', label: 'Rumour tracking and early warning' },
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
          tags: ['access', 'rumour', 'affected'],
        },
        {
          title: 'Types of False Information',
          slug: 'types-of-false-info',
          tags: ['erosion', 'affected'],
        },
        { title: 'Historical Context', slug: 'historical-context', tags: ['safety', 'combat'] },
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

  const statsData = [
    {
      id: 'affected',
      stat: '73.3%',
      text: 'have been personally affected by harmful information',
    },
    {
      id: 'reject',
      stat: '55.0%',
      text: 'have seen people rejecting aid due to false or misleading info',
    },
    {
      id: 'combat',
      stat: '63.5%',
      text: 'have seen groups organize to combat false and misleading info, online or offline',
    },
  ];

  const getIcon = (id) => {
    switch (id) {
      case 'affected':
        return <AlertTriangle size={48} className="text-red-600" />;
      case 'reject':
        return <User size={48} className="text-red-600" />;
      case 'combat':
        return <Shield size={48} className="text-red-600" />;
      default:
        return <Shield size={48} className="text-red-600" />;
    }
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const toggleTag = () => {
    setExpandedTags(!expandedTags);
  };

  const handleSelectionTag = (tagID) => {
    setSelectedTag((prev) => ({
      ...prev,
      [tagID]: !prev[tagID],
    }));
  };

  const handleShuffleTag = () => {
    if (!isShuffleTag) {
      const randomIndex = Math.floor(Math.random() * tag_combo.length);
      setSelectedTag(tag_combo[randomIndex]);
    } else {
      setSelectedTag({});
    }
    setIsShuffleTag(!isShuffleTag);
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

    return filteredContent;
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
        fixed top-0 left-0 h-screen w-110 bg-white shadow-2xl z-50
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
              <h2 className="text-2xl font-bold mb-2">Contributions Reading List</h2>
            </div>
            <div className="h-1 w-90 bg-gradient-to-r from-red-600 to-orange-500 rounded-full" />
          </div>
          <div className="ml-5 text-xl font-bold text-[#ee2435]">
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
                className="px-6 py-3 h-30 flex items-center justify-between text-left border-1 rounded-lg border-stone-400"
              >
                <span className="text-base font-semibold text-stone-800 flex-1 pr-2">
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
                      className="section-link block py-2 text-base text-stone-600 hover:text-red-600"
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
              <span className="text-lg font-bold text-stone-700 uppercase ">
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
                tag-btn px-5 py-2.5 rounded-xl text-lg font-medium transition-all duration-200
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

        {/* Stats Section */}
        <div className="w-full my-12  px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {statsData.map((item, index) => (
              <div
                key={item.id}
                className={`
                relative bg-white rounded-lg border-2 p-6
                transition-all duration-300 hover:shadow-lg
                ${
                  selectedTag[item.id]
                    ? 'border-red-500 shadow-lg shadow-red-500/20 bg-red-50'
                    : 'border-stone-200 hover:border-red-300'
                }
              `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fade-in 0.5s ease-out forwards',
                }}
              >
                {/* Heart Button */}
                <button
                  onClick={() => handleSelectionTag(item.id)}
                  className="absolute top-4 right-4 transition-all duration-200 hover:scale-110"
                  aria-label="Toggle filter"
                >
                  <Heart
                    size={24}
                    className={`
                    ${
                      selectedTag[item.id]
                        ? 'fill-red-500 text-red-500'
                        : 'text-stone-400 hover:text-red-400'
                    }
                  `}
                  />
                </button>

                {/* Content Container */}
                <div className="flex flex-col items-center text-center space-y-4 mt-2">
                  <div className="p-3 bg-red-50 rounded-full">{getIcon(item.id)}</div>
                  <div className="text-4xl font-bold text-stone-800">{item.stat}</div>
                  <p className="text-lg text-stone-600 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
