'use client';

import React from 'react';
import { Funnel } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const TAG_CATEGORIES = [
  {
    id: 'operational_impact',
    labelKey: 'browseOperationalImpact',
    column: 'operational',
    tags: [
      { id: 'access_constraints', label: 'Access constraints and acceptance risks' },
      { id: 'distorted_needs', label: 'Distorted needs and demand signals' },
      { id: 'programme', label: 'Programme effectiveness and accountability' },
      { id: 'safety', label: 'Safety and security of staff and volunteers' },
    ],
  },
  {
    id: 'response_strategy',
    labelKey: 'browseResponseStrategy',
    column: 'response',
    tags: [
      { id: 'community_engagement', label: 'Community engagement and accountability' },
      { id: 'information_aid', label: 'Information as aid' },
      { id: 'prebunking', label: 'Prebunking and narrative resilience' },
      { id: 'rumour_tracking', label: 'Rumour tracking and early warning' },
      { id: 'trusted_messenger', label: 'Trusted messengers and local intermediaries' },
      { id: 'debunking', label: 'Debunking and corrective communication' },
      { id: 'partnership', label: 'Partnership and coordination' },
    ],
  },
  {
    id: 'governance',
    labelKey: 'browseGovernance',
    column: 'governance',
    tags: [
      { id: 'regulation', label: 'Regulation and public policy frameworks' },
      { id: 'freedom', label: 'Freedom of expression and information rights' },
      { id: 'technology_governance', label: 'Technology governance and platform accountability' },
      { id: 'principles', label: 'Humanitarian principles and neutrality' },
    ],
  },
];

export default function TagContainer({ selectedTag, handleSelectionTag }) {
  const t = useTranslations('Engagement');
  const selectedCount = Object.values(selectedTag).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Funnel size={17} className="text-[#ee2435]" />
          <span className="text-sm font-bold text-slate-900">{t('browseTopics')}</span>
          {selectedCount > 0 && (
            <span className="text-xs font-medium text-white bg-[#ee2435] px-2 py-0.5 rounded-full">
              {t('selectedCount', { count: selectedCount })}
            </span>
          )}
        </div>
        <div className="h-0.5 bg-gradient-to-r from-[#ee2435] to-orange-400 rounded-full" />
      </div>

      {/* Responsive tag grid: 1 col mobile, 2 sm, 4 lg */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
          {TAG_CATEGORIES.map((category) => (
            <React.Fragment key={category.id}>
              {/* Full-width section label */}
              <div
                className="col-span-1 sm:col-span-2 lg:col-span-4 text-sm font-bold text-slate-800 pt-3 pb-1"
              >
                {t(category.labelKey)}
              </div>

              {/* Tags — text wraps inside box; min-w-0 allows flex/grid shrink */}
              {category.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleSelectionTag(tag.id)}
                  className={`min-w-0 px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all duration-150 break-words whitespace-normal ${
                    selectedTag[tag.id]
                      ? 'bg-[#ee2435] border-[#ee2435] text-white'
                      : 'bg-white text-[#ee2435] border-[#ee2435]/40 hover:border-[#ee2435] hover:bg-red-50'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
