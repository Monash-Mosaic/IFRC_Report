'use client';
import { useState } from 'react';
import TagContainer from '@/components/engagement/TagContainer';
import QuotesSection from '@/components/engagement/QuotesSection';
// import QuoteMap from '@/components/engagement/QuoteMap';
// import SurveyInsight from '@/components/engagement/SurveyInsight';
// import CommunityResearchInsight from '@/components/engagement/CommunityResearchInsight';

export default function EngagementPage() {
  const [selectedTag, setSelectedTag] = useState({});

  const handleSelectionTag = (tagID) => {
    setSelectedTag((prev) => ({
      ...prev,
      [tagID]: !prev[tagID],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full overflow-hidden" style={{ height: '420px' }}>
        <img
          src="/engagement_page_picture.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <TagContainer selectedTag={selectedTag} handleSelectionTag={handleSelectionTag} />
        {/* <SurveyInsight selectedTag={selectedTag} handleSelectionTag={handleSelectionTag} /> */}
        {/* <QuoteMap selectedTag={selectedTag} handleSelectionTag={handleSelectionTag} /> */}
        <QuotesSection selectedTag={selectedTag} />
        {/* <CommunityResearchInsight /> */}
      </main>
    </div>
  );
}