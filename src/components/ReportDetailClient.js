'use client';

import { Menu, Bookmark, ChevronDown, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { getBookmarks, toggleBookmark } from '@/lib/storage';

export default function ReportDetailClient({ sections, reportTitle, decodedReport, translations }) {
  const [activeMenu, setActiveMenu] = useState('toc');
  const [bookmarkedSections, setBookmarkedSections] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => {
    (async () => {
      const bookmarks = await getBookmarks();
      setBookmarkedSections(bookmarks);
    })();
  }, []);

  const handleToggleBookmark = async (sectionName) => {
    const newBookmarks = await toggleBookmark(sectionName);
    setBookmarkedSections(newBookmarks);
    // Switch to bookmark tab after bookmarking
    if (newBookmarks.has(sectionName)) {
      setActiveMenu('bookmark');
    }
  };

  const toggleExpand = (sectionName) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionName)) {
      newExpandedSections.delete(sectionName);
    } else {
      newExpandedSections.add(sectionName);
    }
    setExpandedSections(newExpandedSections);
  };

  const displayedSections =
    activeMenu === 'toc'
      ? sections
      : sections.filter((section) => bookmarkedSections.has(section.name));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href={'./'} className="flex items-center gap-2 text-black hover:text-gray-600 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <p className="font-semibold">{translations.backToDocuments}</p>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-6">{reportTitle}</h1>

          {/* Overall Progress Bar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-gray-800 h-2 rounded-full w-1/2"></div>
            </div>
            <span className="text-lg font-semibold">50%</span>
          </div>
        </div>

        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setActiveMenu('toc')}
            className={`flex items-center gap-3 ${
              activeMenu === 'toc' ? 'text-black' : 'text-gray-500'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="font-semibold text-lg">{translations.tableOfContent}</span>
          </button>
          <button
            onClick={() => setActiveMenu('bookmark')}
            className={`flex items-center gap-3 ${
              activeMenu === 'bookmark' ? 'text-black' : 'text-gray-500'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-semibold text-lg">{translations.bookmark}</span>
          </button>
        </div>

        <div className="mb-8">
          <div
            className={`h-1 bg-red-500 mb-2 transition-all duration-300 ${
              activeMenu === 'toc' ? 'w-1/2' : 'w-1/2 ml-auto'
            }`}
          ></div>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-white rounded-lg shadow">
          {activeMenu === 'bookmark' && displayedSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">{translations.noBookmarks}</p>
              <p className="text-sm mt-2">{translations.noBookmarksHint}</p>
            </div>
          )}

          {displayedSections.map((section) => (
            <div key={section.name} className="bg-gray-100 p-6 rounded-lg shadow mb-6">
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold text-lg text-black">{section.name}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 cursor-pointer ${
                      expandedSections.has(section.name) ? 'rotate-180' : ''
                    }`}
                    onClick={() => toggleExpand(section.name)}
                  />
                </div>
                <button
                  onClick={() => handleToggleBookmark(section.name)}
                  aria-label={`${
                    bookmarkedSections.has(section.name) ? 'Remove bookmark' : 'Add bookmark'
                  } for ${section.name}`}
                >
                  <Bookmark
                    className={`w-5 h-5 mr-4 transition-colors ${
                      bookmarkedSections.has(section.name)
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-400'
                    }`}
                    fill={bookmarkedSections.has(section.name) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Progress Bar and Continue Button */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-800 h-2 rounded-full"
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium mr-4">{section.progress}%</span>
                <Link
                  className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded"
                  href={`./${decodedReport}/${section.slug}`}
                >
                  {translations.continue}
                </Link>
              </div>

              {/* Summary List */}
              {expandedSections.has(section.name) && (
                <ul className="ml-8 mb-4 list-disc text-gray-700">
                  {section.summary.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
