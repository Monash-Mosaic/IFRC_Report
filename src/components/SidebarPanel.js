"use client"

import { useState } from 'react';
import { Menu, FileText, Volume2, Video, ChevronRight, X, ArrowLeft } from 'lucide-react';

export default function SidebarPanel({ chapterTitle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMediaPanel, setActiveMediaPanel] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);

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
      items: [
        { id: 'audio1', name: 'Audio 1', duration: '12:30' },
        { id: 'audio2', name: 'Audio 2', duration: '8:45' },
        { id: 'audio3', name: 'Audio 3', duration: '15:20' }
      ]
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Video,
      color: 'text-red-600 hover:bg-red-50',
      items: [
        { id: 'video1', name: 'Video 1', duration: '5:30' },
        { id: 'video2', name: 'Video 2', duration: '10:15' },
        { id: 'video3', name: 'Video 3', duration: '7:45' }
      ]
    }
  ];

  const handleMenuItemClick = (menuId) => {
    if (menuId === 'audio' || menuId === 'videos') {
      setActiveMediaPanel(menuId);
      setSelectedTrack(null);
    } else {
      console.log(`Clicked ${menuId}`);
    }
  };

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
  };

  const closeMediaPanel = () => {
    setActiveMediaPanel(null);
    setSelectedTrack(null);
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

      {/* Media Panel (Audio/Video) - Positioned next to sidebar */}
      {activeMediaPanel && isExpanded && (
        <MediaPanel
          mediaType={activeMediaPanel}
          mediaItems={menuItems.find(item => item.id === activeMediaPanel)?.items || []}
          selectedTrack={selectedTrack}
          onTrackSelect={handleTrackSelect}
          onClose={closeMediaPanel}
        />
      )}

      {/* Spacer div to maintain layout when sidebar is collapsed - only on desktop */}
      <div className={`hidden md:block transition-all duration-300 ease-in-out ${isExpanded ? 'w-0' : 'w-16'}`} />
    </>
  );
}

/**
 * Media Panel Component for Audio/Video - Responsive layout
 */
function MediaPanel({ mediaType, mediaItems, selectedTrack, onTrackSelect, onClose }) {
  const isAudio = mediaType === 'audio';
  
  return (
    <div className="fixed top-0 left-0 md:left-80 right-0 bottom-0 bg-white z-45 flex flex-col md:flex-row animate-in slide-in-from-right duration-300 shadow-xl border-l border-gray-200">
      {/* Media List - Top on mobile, Left on desktop */}
      <div className="w-full md:w-96 h-1/2 md:h-full bg-blue-500 flex flex-col border-b md:border-b-0 md:border-r border-blue-400">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-blue-400 flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg md:text-xl capitalize">
            {mediaType} {mediaItems.length > 0 ? '1' : ''}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1"
            aria-label="Close media panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Media List */}
        <div className="flex-1 p-4 md:p-6 space-y-2 md:space-y-3 overflow-y-auto">
          {mediaItems.map((item, index) => (
            <MediaListItem
              key={item.id}
              item={item}
              index={index + 1}
              isSelected={selectedTrack?.id === item.id}
              onSelect={() => onTrackSelect(item)}
            />
          ))}
        </div>
      </div>

      {/* Media Player - Bottom on mobile, Right on desktop */}
      <div className="flex-1 bg-gray-300 flex flex-col">
        {/* Player Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          {selectedTrack ? (
            <MediaPlayer track={selectedTrack} mediaType={mediaType} />
          ) : (
            <div className="text-center text-gray-600">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {isAudio ? (
                  <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                ) : (
                  <Video className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                )}
              </div>
              <p className="text-base md:text-lg">Select a {mediaType} to play</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-100">
          <p className="text-xs text-gray-600 text-center">
            {mediaType} player for enhanced accessibility
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Media List Item Component - Responsive
 */
function MediaListItem({ item, index, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 md:p-4 rounded-lg transition-colors ${
        isSelected 
          ? 'bg-blue-400 text-white' 
          : 'text-white hover:bg-blue-400 hover:bg-opacity-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-base md:text-lg font-semibold min-w-[20px] md:min-w-[24px]">{index}.</span>
          <span className="text-sm md:text-base font-medium">{item.name}</span>
        </div>
        {item.duration && (
          <span className="text-xs md:text-sm opacity-75 font-mono">{item.duration}</span>
        )}
      </div>
    </button>
  );
}

/**
 * Media Player Component - Responsive
 */
function MediaPlayer({ track, mediaType }) {
  const isAudio = mediaType === 'audio';
  
  return (
    <div className="text-center max-w-sm md:max-w-md mx-auto w-full">
      {/* Media Display */}
      {isAudio ? (
        // Audio Player
        <div className="mb-4 md:mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <button className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <div className="w-0 h-0 border-l-[6px] md:border-l-[8px] border-l-gray-700 border-t-[4px] md:border-t-[6px] border-t-transparent border-b-[4px] md:border-b-[6px] border-b-transparent ml-1"></div>
            </button>
          </div>
        </div>
      ) : (
        // Video Player
        <div className="mb-4 md:mb-6">
          <div className="bg-gray-600 rounded-lg aspect-video w-64 md:w-80 mx-auto mb-3 md:mb-4 flex items-center justify-center relative">
            <button className="w-12 h-12 md:w-16 md:h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors">
              <div className="w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-gray-700 border-t-[6px] md:border-t-[8px] border-t-transparent border-b-[6px] md:border-b-[8px] border-b-transparent ml-1"></div>
            </button>
          </div>
        </div>
      )}

      {/* Track Info */}
      <div className="mb-4 md:mb-6">
        <h4 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">{track.name}</h4>
        <p className="text-xs md:text-sm text-gray-600">Duration: {track.duration}</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-200 rounded-lg p-3 md:p-4">
        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
          <div className="flex-1 bg-gray-400 rounded-full h-2 relative">
            <div className="bg-blue-500 rounded-full h-2 w-1/4"></div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>0:00</span>
          <span>{track.duration}</span>
        </div>
      </div>
    </div>
  );
}