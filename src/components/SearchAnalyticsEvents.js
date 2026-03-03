'use client';

import { useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';

const SEARCH_RESULT_LIST_ID = 'search_results';
const SEARCH_RESULT_LIST_NAME = 'Search Results';

function trackGTMEvent(payload) {
  if (typeof window === 'undefined') {
    return;
  }
  sendGTMEvent(payload);
}

function trackOnce(key, callback) {
  if (typeof window === 'undefined') {
    return;
  }

  window.__ifrcTrackedSearchEvents = window.__ifrcTrackedSearchEvents || new Set();
  if (window.__ifrcTrackedSearchEvents.has(key)) {
    return;
  }

  window.__ifrcTrackedSearchEvents.add(key);
  callback();
}

export default function SearchAnalyticsEvents({ locale, query, resultCount, items }) {
  useEffect(() => {
    if (!query) {
      return;
    }

    const key = `${locale}|${query}|${resultCount}|${items.map((item) => item.item_id).join(',')}`;
    trackOnce(`search:${key}`, () => {
      trackGTMEvent({
        event: 'search',
        search_term: query,
        language: locale,
      });

      trackGTMEvent({
        event: 'view_search_results',
        search_term: query,
        language: locale,
        item_list_id: SEARCH_RESULT_LIST_ID,
        item_list_name: SEARCH_RESULT_LIST_NAME,
        results_count: resultCount,
        items,
      });
    });
  }, [items, locale, query, resultCount]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const link = event.target.closest('a[data-search-result="true"]');
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const href = link.dataset.resultHref || link.getAttribute('href') || '';
      const title = link.dataset.resultTitle || '';
      const index = Number.parseInt(link.dataset.resultIndex || '0', 10) || 0;

      trackGTMEvent({
        event: 'select_item',
        search_term: query,
        language: locale,
        item_list_id: SEARCH_RESULT_LIST_ID,
        item_list_name: SEARCH_RESULT_LIST_NAME,
        items: [
          {
            item_id: href,
            item_name: title,
            index,
          },
        ],
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [locale, query]);

  return null;
}
