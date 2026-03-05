'use client';
import { useState, useCallback } from 'react';
import TagContainer from './TagContainer';
import QuotesSection from './QuotesSection';

export default function EngagementClient() {
  const [selectedTag, setSelectedTag] = useState({});

  const handleSelectionTag = useCallback((tagId) => {
    setSelectedTag((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
  }, []);

  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <TagContainer selectedTag={selectedTag} handleSelectionTag={handleSelectionTag} />
<QuotesSection selectedTag={selectedTag} />
      </div>
    </div>
  );
}
