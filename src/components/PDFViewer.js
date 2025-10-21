'use client';

import { useState, useEffect, useRef } from 'react';

export default function PDFViewer({ fileUrl, onClose }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [currentSelection, setCurrentSelection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showManualBookmark, setShowManualBookmark] = useState(false);

  const iframeRef = useRef(null);
  const selectionTimeoutRef = useRef(null);

  useEffect(() => {
    // Load existing bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('pdfBookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    // Set up text selection detection
    const handleMouseUp = () => {
      // Clear any existing timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      // Wait a bit for the selection to complete
      selectionTimeoutRef.current = setTimeout(() => {
        checkForTextSelection();
      }, 100);
    };

    const handleKeyUp = (e) => {
      // Check for text selection on key up (Ctrl+A, etc.)
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        setTimeout(checkForTextSelection, 100);
      }
    };

    // Add event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Save bookmarks to localStorage whenever they change
    localStorage.setItem('pdfBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const checkForTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text && text.length > 0) {
      // Get the position of the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedText(text);
      setCurrentSelection({
        text: text,
        page: currentPage,
        timestamp: Date.now()
      });

      // Position the bookmark toolbar near the selection
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setSelectedText('');
      setCurrentSelection(null);
    }
  };

  const handleSelectionChange = () => {
    // This will be called whenever the selection changes
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text && text.length > 0) {
      // Don't immediately show the toolbar, let the mouseup handler do it
      // This prevents flickering
    } else {
      // Clear the selection after a delay
      setTimeout(() => {
        if (!window.getSelection().toString().trim()) {
          setSelectedText('');
          setCurrentSelection(null);
        }
      }, 200);
    }
  };

  const addBookmark = () => {
    if (currentSelection && bookmarkNote.trim()) {
      const newBookmark = {
        id: Date.now(),
        text: currentSelection.text,
        note: bookmarkNote,
        page: currentPage,
        timestamp: currentSelection.timestamp,
        documentUrl: fileUrl
      };

      setBookmarks(prev => [...prev, newBookmark]);
      setBookmarkNote('');
      setIsAddingBookmark(false);
      setCurrentSelection(null);
      setSelectedText('');
    }
  };

  const addManualBookmark = () => {
    if (bookmarkNote.trim()) {
      const newBookmark = {
        id: Date.now(),
        text: "Manual bookmark",
        note: bookmarkNote,
        page: currentPage,
        timestamp: Date.now(),
        documentUrl: fileUrl
      };

      setBookmarks(prev => [...prev, newBookmark]);
      setBookmarkNote('');
      setShowManualBookmark(false);
    }
  };

  const removeBookmark = (bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const goToBookmark = (bookmark) => {
    setCurrentPage(bookmark.page);
    setShowBookmarks(false);

    // Try to communicate with the PDF iframe to go to specific page
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'goToPage',
          page: bookmark.page
        }, '*');
      } catch (error) {
        console.log('Could not communicate with PDF iframe');
      }
    }
  };

  const handleIframeLoad = () => {
    // Inject custom CSS and JavaScript for better text selection
    if (iframeRef.current) {
      try {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Add custom styles for text selection
        const style = iframeDoc.createElement('style');
        style.textContent = `
          ::selection {
            background: rgba(59, 130, 246, 0.3) !important;
          }
          ::-moz-selection {
            background: rgba(59, 130, 246, 0.3) !important;
          }
        `;
        iframeDoc.head.appendChild(style);

        // Add event listeners to the iframe content
        iframeDoc.addEventListener('mouseup', () => {
          setTimeout(() => {
            try {
              const iframeSelection = iframeDoc.getSelection();
              const text = iframeSelection.toString().trim();

              if (text && text.length > 0) {
                const range = iframeSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Convert iframe coordinates to page coordinates
                const iframeRect = iframe.getBoundingClientRect();
                const pageX = iframeRect.left + rect.left + rect.width / 2;
                const pageY = iframeRect.top + rect.top - 10;

                setSelectedText(text);
                setCurrentSelection({
                  text: text,
                  page: currentPage,
                  timestamp: Date.now()
                });
                setSelectionPosition({ x: pageX, y: pageY });
              }
            } catch (error) {
              console.log('Error reading iframe selection:', error);
            }
          }, 100);
        });
      } catch (error) {
        console.log('Could not inject styles into PDF iframe');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">PDF Viewer</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualBookmark(!showManualBookmark)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Bookmark
            </button>
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Bookmarks ({bookmarks.length})
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=${currentPage}`}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title="PDF Viewer"
            />

            {/* Text Selection Toolbar - Positioned absolutely */}
            {selectedText && (
              <div
                className="fixed bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-50"
                style={{
                  left: `${selectionPosition.x}px`,
                  top: `${selectionPosition.y}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm max-w-xs truncate">{selectedText}</span>
                  <button
                    onClick={() => setIsAddingBookmark(true)}
                    className="px-2 py-1 bg-white text-blue-600 text-xs rounded hover:bg-gray-100 whitespace-nowrap"
                  >
                    Bookmark
                  </button>
                </div>
              </div>
            )}

            {/* Manual Bookmark Form */}
            {showManualBookmark && (
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg border border-gray-200 shadow-lg z-50 w-80">
                <h4 className="font-medium text-gray-900 mb-2">Add Manual Bookmark</h4>
                <p className="text-sm text-gray-600 mb-2">Page {currentPage}</p>
                <textarea
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="Add a note about this page..."
                  className="w-full p-2 border border-gray-300 rounded text-sm mb-3"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addManualBookmark}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowManualBookmark(false);
                      setBookmarkNote('');
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bookmarks Sidebar */}
          {showBookmarks && (
            <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bookmarks</h3>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Add Bookmark Form */}
              {isAddingBookmark && currentSelection && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Add Bookmark</h4>
                  <p className="text-sm text-gray-600 mb-2">{currentSelection.text}</p>
                  <textarea
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                    placeholder="Add a note about this highlight..."
                    className="w-full p-2 border border-gray-300 rounded text-sm mb-3"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addBookmark}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingBookmark(false);
                        setCurrentSelection(null);
                        setSelectedText('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Bookmarks List */}
              <div className="space-y-3">
                {bookmarks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookmarks yet</p>
                ) : (
                  bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-500">Page {bookmark.page}</span>
                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-900 mb-2 font-medium">{bookmark.text}</p>
                      {bookmark.note && (
                        <p className="text-sm text-gray-600 mb-2">{bookmark.note}</p>
                      )}
                      <button
                        onClick={() => goToBookmark(bookmark)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Go to Page
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>How to bookmark:</strong>
            <br />
            <strong>Method 1:</strong> Select text in the PDF by clicking and dragging → Blue Bookmark button appears
            <br />
            <strong>Method 2:</strong> Click &quot;Add Bookmark&ldquot; button to manually add a page bookmark
            <br />
            <strong>Method 3:</strong> Use Ctrl+A (or Cmd+A) to select all text on a page
            <br />
            Use the Bookmarks panel to view and manage all your highlights
          </p>
        </div>
      </div>
    </div>
  );
}
