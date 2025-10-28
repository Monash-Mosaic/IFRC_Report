"use client"

import { useState } from 'react';
import { Menu, FileText, Volume2, Video, ChevronRight, X, ArrowLeft } from 'lucide-react';

export default function SidebarPanel({ chapterTitle }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      color: 'text-blue-600 hover:bg-blue-50',
      items: ['Chapter Notes', 'My Notes', 'Bookmarks']
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: Volume2,
      color: 'text-green-600 hover:bg-green-50',
      items: ['Chapter Audio', 'Interviews', 'Podcasts']
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Video,
      color: 'text-red-600 hover:bg-red-50',
      items: ['Chapter Video', 'Case Studies', 'Testimonials']
    }
  ];

  const handleMenuItemClick = (menuId) => {
    console.log(`Clicked ${menuId}`);
    // TODO: Implement functionality for each menu item
  };

  return (
    <>
      {/* Fixed/Sticky Toggle Button - Only show when sidebar is collapsed */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-20 left-4 z-50 w-12 h-12 bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-xl"
          aria-label="Expand sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Content - Only show when expanded */}
      {isExpanded && (
        <div className="fixed top-0 left-0 w-80 h-full bg-white border-r border-gray-200 shadow-xl z-40 overflow-y-auto animate-in slide-in-from-left duration-300">
          <div className="p-4">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Resources</h2>
              <p className="text-sm text-gray-600 line-clamp-2" title={chapterTitle}>
                {chapterTitle}
              </p>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${item.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Chapter Resources Panel
              </p>
            </div>
          </div>
        </div>
      )}

     {/* Overlay to close sidebar when clicking outside - transparent */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Spacer div to maintain layout when sidebar is collapsed */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'w-0' : 'w-16'}`} />
    </>
  );
}