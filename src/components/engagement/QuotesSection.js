'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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

// Types of Harm (TOH): map harm tag labels to icon + display name for tooltip
const HARM_TAG_TO_ICON = [
  { label: 'psychological', displayLabel: 'Psychological', Icon: User },
  { label: 'societal', displayLabel: 'Societal', Icon: Building2 },
  { label: 'social', displayLabel: 'Social', Icon: Smartphone },
  { label: 'informational', displayLabel: 'Informational', Icon: Wifi },
  { label: 'digital/technological', displayLabel: 'Digital/technological', Icon: Monitor },
  { label: 'physical', displayLabel: 'Physical', Icon: Activity },
  { label: 'deprivational/financial/economic', displayLabel: 'Deprivational/financial/economic', Icon: Activity },
];

/** Parse CSV with proper handling of quoted fields (commas and newlines inside quotes). */
function parseCSV(text) {
  return parseDelimited(text, ',');
}

/** Parse TSV (tab-separated) so commas in descriptions don't break parsing. Use when exporting from Sheets. */
function parseTSV(text) {
  return parseDelimited(text, '\t');
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') { currentField += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
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

/** CH1 -> "Chapter 1", CH2 -> "Chapter 2", etc. */
function formatChapterLabel(chapterCode) {
  if (!chapterCode || typeof chapterCode !== 'string') return '';
  const m = chapterCode.trim().match(/^CH(\d+)$/i);
  return m ? `Chapter ${m[1]}` : chapterCode;
}

/** Resolve quote harm tags to TOH icons with labels (unique by Icon, ordered). Only icons that match are returned. */
function getIconsForHarm(harmStr) {
  const tags = parseTags(harmStr).map((t) => t.toLowerCase().trim());
  const byIcon = new Map();
  for (const { label, displayLabel, Icon } of HARM_TAG_TO_ICON) {
    const labelNorm = label.toLowerCase();
    const matches = tags.some((t) => t.includes(labelNorm) || labelNorm.includes(t));
    if (matches) {
      const existing = byIcon.get(Icon);
      if (existing) existing.labels.push(displayLabel);
      else byIcon.set(Icon, { Icon, labels: [displayLabel] });
    }
  }
  return Array.from(byIcon.values());
}

function QuoteCard({ quote }) {
  const chapterTitle = CHAPTER_TITLES[quote.chapter];
  const chapterLabel = formatChapterLabel(quote.chapter);
  const tohItems = getIconsForHarm(quote.harm);

  return (
    <div
      className="flex-shrink-0 bg-white rounded-xl border-2 border-[#ee2435] flex flex-col"
      style={{ width: '280px' }}
    >
      <div className="p-5 flex flex-col gap-4">
        {/* Quote text */}
        <p className="text-sm text-slate-800 leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>

        {/* TOH icons grouped together; hover shows TOH name in tooltip */}
        {tohItems.length > 0 && (
          <div className="flex flex-wrap gap-2 overflow-visible">
            {tohItems.map((item, i) => {
              const Icon = item.Icon;
              const tooltipText = item.labels && item.labels.length > 0 ? item.labels.join(', ') : '';
              return (
                <div
                  key={i}
                  className="relative group flex items-center justify-center w-9 h-9 rounded-full bg-[#ee2435] cursor-help shrink-0"
                  title={tooltipText}
                >
                  <Icon size={16} className="text-white" strokeWidth={1.8} />
                  {tooltipText && (
                    <span
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap"
                      role="tooltip"
                    >
                      {tooltipText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        {chapterLabel && (
          <span className="text-xs font-bold text-[#ee2435] underline underline-offset-2">
            {chapterLabel}
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
  const t = useTranslations('Engagement');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const parse = (text, url) => (url.endsWith('.tsv') ? parseTSV(text) : parseCSV(text));
    fetch('/engagement/engagement_tab.tsv')
      .then((r) => {
        if (r.ok) return r.text().then((text) => ({ text, url: '/engagement/engagement_tab.tsv' }));
        return fetch('/engagement/engagement_tab.csv').then((r2) => {
          if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
          return r2.text().then((text) => ({ text, url: '/engagement/engagement_tab.csv' }));
        });
      })
      .then(({ text, url }) => {
        const rows = parse(text, url);
        if (!rows?.length || !rows[0]?.length) {
          setQuotes([]);
          return;
        }
        const headers = rows[0].map((h) => h.trim());
        const colIndex = {};
        headers.forEach((h, i) => { colIndex[h] = i; });
        if (colIndex['Quote text'] == null) {
          setQuotes([]);
          return;
        }
        const quoteTextIdx = colIndex['Quote text'];
        const isValidQuoteText = (val) => {
          if (!val || typeof val !== 'string') return false;
          const v = val.trim();
          if (/^CH\d+$/i.test(v) || /^\d+$/.test(v)) return false;
          return v.length > 0;
        };
        const parsed = rows
          .slice(1)
          .filter((row) => isValidQuoteText(row[quoteTextIdx]))
          .map((row) => ({
            id: row[colIndex['Q_ID']],
            text: (row[quoteTextIdx] || '').trim(),
            chapter: (row[colIndex['Chapter']] || '').trim(),
            country: (row[colIndex['country_region']] || '').trim(),
            harm: (row[colIndex['tag:harm']] || '').trim(),
            operational: (row[colIndex['tag:operational_impact']] || '').trim(),
            response: (row[colIndex['tag:response_strategy']] || '').trim(),
            governance: (row[colIndex['tag:governance']] || '').trim(),
          }));
        setQuotes(parsed);
      })
      .catch((err) => setError(err?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const activeTagIds = Object.keys(selectedTag).filter((k) => selectedTag[k]);
    if (activeTagIds.length === 0) return quotes;

    return quotes.filter((quote) =>
      activeTagIds.some((tagId) => {
        const tagInfo = TAG_COLUMN_MAP[tagId];
        if (!tagInfo) return false;
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
          <span className="text-sm font-bold text-slate-900">{t('quotesTitle')}</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>
        {activeCount > 0 && (
          <span className="text-xs text-slate-400">
            {t('filtersActive', { count: activeCount })}
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
          {t('loadingQuotes')}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600 text-sm bg-white rounded-xl border border-slate-200">
          {t('errorLoadingQuotes')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
          {t('noQuotesMatch')}
        </div>
      ) : (
        <div
          className="flex items-start gap-4 overflow-x-auto pb-3"
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
