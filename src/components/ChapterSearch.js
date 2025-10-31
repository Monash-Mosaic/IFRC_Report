'use client';

import { useState, useCallback, useEffect, use } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ChapterSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const t = useTranslations();

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search within chapter..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {query.trim().length >= 2 && !isLoading && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  {result.heading && (
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      {result.heading}
                    </h3>
                  )}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.excerpt}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Section Level: {result.level}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Initial State */}
      {query.trim().length < 2 && !isLoading && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Start typing to search within the chapter</p>
        </div>
      )}
    </div>
  );
}
