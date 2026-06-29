'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { QuoteIcon } from 'lucide-react';
import QuoteTile from '@/components/engagement/QuoteTile';
import QuotesPagination from '@/components/engagement/QuotesPagination';
import { parseTags } from '@/lib/quoteHarmIcons';
import { TAG_COLUMN_MAP } from '@/reports/en/engagement';
import { TAG_COLUMN_MAP as TAG_COLUMN_MAP_FR } from '@/reports/fr/engagement';

const TILES_PER_PAGE = 3;

/** Parse TSV (tab-separated) so commas in descriptions don't break parsing. */
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

export default function QuotesSection({ selectedTag }) {
  const t = useTranslations('Discover');
  const locale = useLocale();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageState, setPageState] = useState({ listKey: '', page: 0 });

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / TILES_PER_PAGE));

  const listKey = useMemo(() => filtered.map((q) => q.id).join('|'), [filtered]);

  const page =
    listKey === pageState.listKey
      ? Math.min(pageState.page, totalPages - 1)
      : 0;

  const setPage = (updater) => {
    setPageState((prev) => {
      const basePage = listKey === prev.listKey ? prev.page : 0;
      const next =
        typeof updater === 'function' ? updater(basePage) : updater;
      return {
        listKey,
        page: Math.min(Math.max(0, next), totalPages - 1),
      };
    });
  };

  const pageQuotes = useMemo(() => {
    const start = page * TILES_PER_PAGE;
    return filtered.slice(start, start + TILES_PER_PAGE);
  }, [filtered, page]);

  const activeCount = Object.values(selectedTag).filter(Boolean).length;

  return (
    <div>
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
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            {pageQuotes.map((quote) => (
              <QuoteTile key={quote.id} quote={quote} />
            ))}
          </div>
          <QuotesPagination
            locale={locale}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          />
        </div>
      )}
    </div>
  );
}