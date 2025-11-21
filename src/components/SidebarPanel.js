"use client"

import { useReducer } from 'react';
import { useTranslations } from 'next-intl';
import { YouTubeEmbed } from '@next/third-parties/google';
import { Menu, FileText, Volume2, Video, ChevronRight, X, ArrowLeft } from 'lucide-react';

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Action types
const TOGGLE_SIDEBAR_ACTION = 'TOGGLE_SIDEBAR';
const SET_SELECTED_TRACK_ACTION = 'SET_SELECTED_TRACK';
const CLOSE_MEDIA_PANEL_ACTION = 'CLOSE_MEDIA_PANEL';
const SET_ACTIVE_NOTES_PANEL_ACTION = 'SET_ACTIVE_NOTES_PANEL';
const SET_ACTIVE_AUDIOS_PANEL_ACTION = 'SET_ACTIVE_AUDIOS_PANEL';
const SET_ACTIVE_VIDEOS_PANEL_ACTION = 'SET_ACTIVE_VIDEOS_PANEL';

// Initial state
const initialState = {
  isExpanded: false,
  activeMediaPanel: null,
  selectedTrack: null,
  loading: false,
  media: { audios: [], videos: [] },
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR_ACTION:
      return { ...state, isExpanded: action.payload };
    case SET_SELECTED_TRACK_ACTION:
      return { ...state, selectedTrack: action.payload };
    case CLOSE_MEDIA_PANEL_ACTION:
      return { ...state, activeMediaPanel: null, selectedTrack: null };
    case SET_ACTIVE_NOTES_PANEL_ACTION:
      return { ...state, activeMediaPanel: null, selectedTrack: null };
    case SET_ACTIVE_AUDIOS_PANEL_ACTION:
      return { 
        ...state, 
        activeMediaPanel: 'audio', 
        selectedTrack: state.media.audios[0] ?? null 
      };
    case SET_ACTIVE_VIDEOS_PANEL_ACTION:
      return { 
        ...state, 
        activeMediaPanel: 'videos', 
        selectedTrack: state.media.videos[0] ?? null 
      };
    default:
      return state;
  }
}

export default function SidebarPanel({ chapterTitle, audios = [], videos = [] }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, media: { audios, videos } });
  const t = useTranslations('SidebarPanel');

  const { isExpanded, activeMediaPanel, selectedTrack, loading, media } = state;

  const menuItems = [
    {
      id: 'notes',
      label: t('panel.notes') || 'Notes',
      icon: FileText,
      color: 'text-gray-700 hover:bg-blue-50',
      items: ['Chapter Notes', 'My Notes', 'Bookmarks'],
      onClick: () => dispatch({ type: SET_ACTIVE_NOTES_PANEL_ACTION }),
    },
    {
      id: 'audio',
      label: t('panel.audios') || 'Audio',
      icon: Volume2,
      color: 'text-gray-700 hover:bg-green-50',
      onClick: () => dispatch({ type: SET_ACTIVE_AUDIOS_PANEL_ACTION }),
      items: media.audios
    },
    {
      id: 'videos',
      label: t('panel.videos') || 'Videos',
      icon: Video,
      color: 'text-gray-700 hover:bg-red-50',
      onClick: () => dispatch({ type: SET_ACTIVE_VIDEOS_PANEL_ACTION }),
      items: media.videos
    }
  ];

  return (
    <>
      {/* Fixed/Sticky Toggle Button - Only show when sidebar is collapsed */}
      {!isExpanded && (
        <button
          onClick={() => dispatch({ type: TOGGLE_SIDEBAR_ACTION, payload: true })}
          className="fixed top-20 left-4 z-50 w-12 h-12 bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-xl"
          aria-label={t('expandSidebar') || 'Expand sidebar'}
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
                onClick={() => dispatch({ type: TOGGLE_SIDEBAR_ACTION, payload: false })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                aria-label={t('closeSidebar') || 'Close sidebar'}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">{t('back') || 'Back'}</span>
              </button>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('resources') || 'Resources'}</h2>
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
                    onClick={item.onClick}
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
                {t('chapterResourcesPanel') || 'Chapter Resources Panel'}
              </p>
            </div>
          </div>
        </div>
      )}

     {/* Overlay to close sidebar when clicking outside - transparent */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => dispatch({ type: TOGGLE_SIDEBAR_ACTION, payload: false })}
        />
      )}

      {/* Media Panel (Audio/Video) - Positioned next to sidebar */}
      {activeMediaPanel && isExpanded && (
        <MediaPanel
          mediaType={activeMediaPanel}
          loading={loading}
          mediaItems={menuItems.find(item => item.id === activeMediaPanel)?.items || []}
          selectedTrack={selectedTrack}
          onTrackSelect={(track) => dispatch({ type: SET_SELECTED_TRACK_ACTION, payload: track })}
          onClose={() => dispatch({ type: CLOSE_MEDIA_PANEL_ACTION })}
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
function MediaPanel({ mediaType, mediaItems, selectedTrack, onTrackSelect, onClose, loading }) {
  const t = useTranslations('SidebarPanel');
  const isAudio = mediaType === 'audio';
  
  return (
    <div className="fixed top-0 left-0 md:left-80 right-0 bottom-0 bg-white z-45 flex flex-col md:flex-row animate-in slide-in-from-right duration-300 shadow-xl border-l border-gray-200">
      {/* Media List - Top on mobile, Left on desktop */}
      <div className="w-full md:w-96 h-1/2 md:h-full bg-blue-500 flex flex-col border-b md:border-b-0 md:border-r border-blue-400">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-blue-400 flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg md:text-xl capitalize">
            {t(mediaType) || mediaType} {mediaItems.length > 0 ? '1' : ''}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1"
            aria-label={t('closeMediaPanel') || 'Close media panel'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Media List */}
        <div className="flex-1 p-4 md:p-6 space-y-2 md:space-y-3 overflow-y-auto">
          {loading && (
            <div className="text-white/90">{t('loading') || 'Loading'} {t(mediaType) || mediaType}...</div>
          )}
          {!loading && mediaItems.length === 0 && (
            <div className="text-white/90">{t('noMediaAvailable') || 'No'} {t(mediaType) || mediaType} {t('availableForChapter') || 'available for this chapter'}.</div>
          )}
          {!loading && mediaItems.map((item, index) => (
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
            <MediaPlayer track={selectedTrack} mediaType={mediaType} t={t} />
          ) : (
            <div className="text-center text-gray-600">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {isAudio ? (
                  <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                ) : (
                  <Video className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                )}
              </div>
              <p className="text-base md:text-lg">{t('selectMediaToPlay') || 'Select a'} {t(mediaType) || mediaType} {t('toPlay') || 'to play'}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-100">
          <p className="text-xs text-gray-600 text-center">
            {t(mediaType) || mediaType} {t('playerForAccessibility') || 'player for enhanced accessibility'}
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
function MediaPlayer({ track, mediaType, t }) {
  const isAudio = mediaType === 'audio';
  
  return (
    <div className="text-center max-w-sm md:max-w-md mx-auto w-full">
      {/* Media Display */}
      {isAudio ? (
        <div className="mb-4 md:mb-6">
          <audio key={track.id} controls className="w-full" data-testid="audio-player" src={track.url}>
            <source src={track.url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : (
        <div className="mb-4 md:mb-6">
          {(() => {
            const youtubeVideoId = extractYouTubeVideoId(track.url);
            
            if (youtubeVideoId) {
              // Use YouTube embed for YouTube URLs
              return (
                <div className="w-full rounded-lg overflow-hidden">
                  <YouTubeEmbed 
                    videoid={youtubeVideoId} 
                    height={300}
                    params="modestbranding=1&rel=0"
                  />
                </div>
              );
            } else {
              // Fallback to native HTML video for non-YouTube URLs
              return (
                <video
                  key={track.id}
                  controls
                  className="w-full max-h-[60vh] bg-black rounded-lg"
                  poster={track.thumbnail || undefined}
                  data-testid="video-player"
                >
                  <source src={track.url} />
                  Your browser does not support the video tag.
                </video>
              );
            }
          })()}
        </div>
      )}

      {/* Track Info */}
      <div className="mb-4 md:mb-6">
        <h4 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">{track.name}</h4>
        {track.duration && (
          <p className="text-xs md:text-sm text-gray-600">{t('duration') || 'Duration'}: {track.duration}</p>
        )}
      </div>
    </div>
  );
}