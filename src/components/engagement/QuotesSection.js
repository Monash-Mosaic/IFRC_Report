'use client';
import { useEffect, useMemo, useState } from 'react';
import { QuoteIcon, Monitor, Wifi, Smartphone, Activity, User, Building2 } from 'lucide-react';

const TAG_COLUMN_MAP = {
  psychological:         { column: 'harm',        label: 'Psychological' },
  societal:              { column: 'harm',        label: 'Societal' },
  social:                { column: 'harm',        label: 'Social' },
  informational:         { column: 'harm',        label: 'Informational' },
  digital_technological: { column: 'harm',        label: 'Digital/technological' },
  physical:              { column: 'harm',        label: 'Physical' },
  deprivational:         { column: 'harm',        label: 'Deprivational/financial/economic' },

  programme:             { column: 'operational', label: 'Programme effectiveness and accountability' },
  distorted_needs:       { column: 'operational', label: 'Distorted needs and demand signals' },
  safety:                { column: 'operational', label: 'Safety and security of staff and volunteers' },
  access_constraints:    { column: 'operational', label: 'Access constraints and acceptance risks' },

  prebunking:            { column: 'response',    label: 'Prebunking and narrative resilience' },
  debunking:             { column: 'response',    label: 'Debunking and corrective communication' },
  trusted_messenger:     { column: 'response',    label: 'Trusted messengers and local intermediaries' },
  community_engagement:  { column: 'response',    label: 'Community engagement and accountability' },
  rumour_tracking:       { column: 'response',    label: 'Rumour tracking and early warning' },
  information_aid:       { column: 'response',    label: 'Information as aid' },
  partnership:           { column: 'response',    label: 'Partnership and coordination' },

  principles:            { column: 'governance',  label: 'Humanitarian principles and neutrality' },
  regulation:            { column: 'governance',  label: 'Regulation and public policy frameworks' },
  freedom:               { column: 'governance',  label: 'Freedom of expression and information rights' },
  technology_governance: { column: 'governance',  label: 'Technology governance and platform accountability' },
};

const CHAPTER_TITLES = {
  CH1: 'Crisis Chaos and Confusion',
  CH2: 'Trust, Perception and Harmful Information',
  CH3: 'Detecting and Understanding Harmful Information',
  CH4: 'Protecting Reputation and Maintaining Trust',
  CH5: 'Regulation and Rights in the Information Environment',
  CH6: 'Community Voices and Lived Experiences',
  CH7: 'National Society Case Studies',
  CH8: 'Recommendations and the Path Forward',
};

// Six thematic icons shown on every card
const THEME_ICONS = [Monitor, Wifi, Smartphone, Activity, User, Building2];

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') { currentField += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim()); currentField = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f !== '')) rows.push(currentRow);
      currentRow = []; currentField = '';
    } else if (char === '\r') {
      // skip
    } else {
      currentField += char;
    }
  }
  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f !== '')) rows.push(currentRow);
  return rows;
}

function parseTags(str) {
  return (str || '').split(';').map((t) => t.trim()).filter(Boolean);
}

function QuoteCard({ quote }) {
  const chapterTitle = CHAPTER_TITLES[quote.chapter];

  return (
    <div
      className="flex-shrink-0 bg-white rounded-xl border-2 border-[#ee2435] flex flex-col overflow-hidden"
      style={{ width: '280px' }}
    >
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Quote text */}
        <p className="text-sm text-slate-800 leading-relaxed flex-1">
          "{quote.text}"
        </p>

        {/* 2×3 grid of circular icon badges */}
        <div className="grid grid-cols-3 gap-2">
          {THEME_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#ee2435]"
            >
              <Icon size={16} className="text-white" strokeWidth={1.8} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        {quote.chapter && (
          <span className="text-xs font-bold text-[#ee2435] underline underline-offset-2">
            {quote.chapter}
          </span>
        )}
        {chapterTitle && (
          <span className="text-xs font-bold text-slate-800 ml-1">
            {chapterTitle}
          </span>
        )}
        {quote.country && (
          <div className="text-[10px] text-slate-400 mt-1">{quote.country}</div>
        )}
      </div>
    </div>
  );
}

export default function QuotesSection({ selectedTag }) {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    fetch('/data/engagement_tab.csv')
      .then((r) => r.text())
      .then((text) => {
        const rows = parseCSV(text);
        const headers = rows[0].map((h) => h.trim());
        const colIndex = {};
        headers.forEach((h, i) => { colIndex[h] = i; });

        const parsed = rows
          .slice(1)
          .filter((row) => row[colIndex['Quote text']]?.length > 0)
          .map((row) => ({
            id: row[colIndex['Q_ID']],
            text: row[colIndex['Quote text']],
            chapter: (row[colIndex['Chapter']] || '').trim(),
            country: (row[colIndex['country_region']] || '').trim(),
            harm: (row[colIndex['tag:harm']] || '').trim(),
            operational: (row[colIndex['tag:operational_impact']] || '').trim(),
            response: (row[colIndex['tag:response_strategy']] || '').trim(),
            governance: (row[colIndex['tag:governance']] || '').trim(),
          }));

        setQuotes(parsed);
      });
  }, []);

  const filtered = useMemo(() => {
    const activeTagIds = Object.keys(selectedTag).filter((k) => selectedTag[k]);
    if (activeTagIds.length === 0) return quotes;

    return quotes.filter((quote) =>
      activeTagIds.every((tagId) => {
        const tagInfo = TAG_COLUMN_MAP[tagId];
        if (!tagInfo) return true;
        const values = parseTags(quote[tagInfo.column]).map((v) => v.toLowerCase());
        return values.some((v) => v.includes(tagInfo.label.toLowerCase()));
      })
    );
  }, [quotes, selectedTag]);

  const activeCount = Object.values(selectedTag).filter(Boolean).length;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <QuoteIcon size={16} className="text-[#ee2435]" />
          <span className="text-sm font-bold text-slate-900">Quotes</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>
        {activeCount > 0 && (
          <span className="text-xs text-slate-400">
            {activeCount} filter{activeCount > 1 ? 's' : ''} active
          </span>
        )}
      </div>

      {quotes.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
          Loading quotes…
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
          No quotes match the selected filters.
        </div>
      ) : (
        <div
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
        >
          {filtered.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}
