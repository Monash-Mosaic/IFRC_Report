'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { QuoteIcon, Monitor, Wifi, Smartphone, Activity, User, Building2 } from 'lucide-react';
import EmblaCarousel from '@/components/EmblaCarousel';
import {
  TAG_COLUMN_MAP as TAG_COLUMN_MAP,
  CHAPTER_TITLES as CHAPTER_TITLES,
} from '@/reports/en/engagement';

import {
  TAG_COLUMN_MAP as TAG_COLUMN_MAP_FR,
  CHAPTER_TITLES as CHAPTER_TITLES_FR,
} from '@/reports/fr/engagement';


// Types of Harm (TOH): map harm tag labels to icon + display name for tooltip
const HARM_TAG_TO_ICON = [
  {
    labels: ['psychological', 'psychologique'],
    displayLabel: { en: 'Psychological', fr: 'Psychologique' },
    Icon: User,
  },
  {
    labels: ['societal', 'sociétal', 'societal'],
    displayLabel: { en: 'Societal', fr: 'Sociétal' },
    Icon: Building2,
  },
  {
    labels: ['social'],
    displayLabel: { en: 'Social', fr: 'Social' },
    Icon: Smartphone,
  },
  {
    labels: ['informational', 'informationnel'],
    displayLabel: { en: 'Informational', fr: 'Informationnel' },
    Icon: Wifi,
  },
  {
    labels: ['digital/technological', 'numérique/technologique'],
    displayLabel: { en: 'Digital/technological', fr: 'Numérique/technologique' },
    Icon: Monitor,
  },
  {
    labels: ['physical', 'physique'],
    displayLabel: { en: 'Physical', fr: 'Physique' },
    Icon: Activity,
  },
  {
    labels: ['deprivational/financial/economic', 'financier/économique/lié à la privation'],
    displayLabel: {
      en: 'Deprivational/financial/economic',
      fr: 'Financier/économique/lié à la privation',
    },
    Icon: Activity,
  },
];

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
function formatChapterLabel(chapterCode, locale = 'en') {
  if (!chapterCode || typeof chapterCode !== 'string') return '';
  const m = chapterCode.trim().match(/^CH(\d+)$/i);
  if (!m) return chapterCode;

  return locale === 'fr' ? `Chapitre ${m[1]}` : `Chapter ${m[1]}`;
}

/** Resolve quote harm tags to TOH icons with labels (unique by Icon, ordered). Only icons that match are returned. */
function getIconsForHarm(harmStr, locale = 'en') {
  const tags = parseTags(harmStr).map((t) => t.toLowerCase().trim());
  const byIcon = new Map();

  for (const { labels, displayLabel, Icon } of HARM_TAG_TO_ICON) {
    const matches = labels.some((label) => {
      const labelNorm = label.toLowerCase();
      return tags.some((t) => t.includes(labelNorm) || labelNorm.includes(t));
    });

    if (matches) {
      const localizedLabel = displayLabel[locale] || displayLabel.en;
      const existing = byIcon.get(Icon);

      if (existing) existing.labels.push(localizedLabel);
      else byIcon.set(Icon, { Icon, labels: [localizedLabel] });
    }
  }

  return Array.from(byIcon.values());
}

/** Fixed height so all cards match; quote text scrolls when long */
const QUOTE_CARD_HEIGHT = 340;
const QUOTE_CARD_WIDTH = 280;

function QuoteCard({ quote, locale }) {
  const chapterTitle =
    locale === 'fr'
      ? CHAPTER_TITLES_FR[quote.chapter]
      : CHAPTER_TITLES[quote.chapter];
  const chapterLabel = formatChapterLabel(quote.chapter, locale);
  const tohItems = getIconsForHarm(quote.harm, locale);

  return (
    <div
      className="flex-shrink-0 bg-white rounded-xl border-2 border-[#ee2435] flex flex-col"
      style={{ width: `${QUOTE_CARD_WIDTH}px`, height: `${QUOTE_CARD_HEIGHT}px` }}
    >
      {/* Scrollable quote + icons; fixed card height */}
      <div className="p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="text-sm text-slate-800 leading-relaxed overflow-y-auto overscroll-contain pr-1">
          &ldquo;{quote.text}&rdquo;
        </div>

        {/* TOH icons grouped together; hover shows TOH name in tooltip */}
        {tohItems.length > 0 && (
          <div className="flex flex-wrap gap-2 overflow-visible shrink-0">
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
      <div className="px-5 py-4 border-t border-slate-100 shrink-0">
        {chapterLabel && (
          quote.url ? (
            <a
              href={quote.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#ee2435] underline underline-offset-2"
            >
              {chapterLabel}
            </a>
          ) : (
            <span className="text-xs font-bold text-[#ee2435] underline underline-offset-2">
              {chapterLabel}
            </span>
          )
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
  const t = useTranslations('Discover');
  const locale = useLocale();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tsvFile =
      locale === 'fr'
        ? '/engagement/french-engagement_tab.tsv'
        : '/engagement/engagement_tab.tsv';

    fetch(tsvFile)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        const rows = parseTSV(text);
        if (!rows?.length || !rows[0]?.length) {
          setQuotes([]);
          return;
        }
        const headers = rows[0].map((h) => h.trim());
        const colIndex = {};
        headers.forEach((h, i) => { colIndex[h] = i; });
        const quoteTextIdx = colIndex['Quote text'];
        if (quoteTextIdx == null) {
          setQuotes([]);
          return;
        }
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
            url: colIndex['url'] != null ? (row[colIndex['url']] || '').trim() : '',
          }));
        setQuotes(parsed);
      })
      .catch((err) => setError(err?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [locale]);

  const filtered = useMemo(() => {
    const activeTagIds = Object.keys(selectedTag).filter((k) => selectedTag[k]);
    if (activeTagIds.length === 0) return quotes;

    return quotes.filter((quote) =>
      activeTagIds.some((tagId) => {
        const activeTagMap = locale === 'fr' ? TAG_COLUMN_MAP_FR : TAG_COLUMN_MAP;
        const tagInfo = activeTagMap[tagId];
        if (!tagInfo) return false;
        const values = parseTags(quote[tagInfo.column]).map((v) => v.toLowerCase());
        return values.some((v) => v.includes(tagInfo.label.toLowerCase()));
      })
    );
  }, [quotes, selectedTag, locale]);

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
        <EmblaCarousel
          locale={locale}
          slideWidth={280}
          loop={false}
          showArrows={true}
          arrowsPosition="bottom"
          className="!space-y-4"
          containerClassName="pb-3"
        >
          {filtered.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} locale={locale} />
          ))}
        </EmblaCarousel>
      )}
    </div>
  );
}