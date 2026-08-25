import { render, fireEvent, screen } from '@testing-library/react';
import Link from 'next/link';
import { sendGTMEvent } from '@next/third-parties/google';
import SearchAnalyticsEvents from '@/components/SearchAnalyticsEvents';

describe('SearchAnalyticsEvents', () => {
  beforeEach(() => {
    sendGTMEvent.mockClear();
    delete window.__ifrcTrackedSearchEvents;
  });

  it('renders nothing', () => {
    const { container } = render(
      <SearchAnalyticsEvents locale="en" query="" resultCount={0} items={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('tracks search and view_search_results once per query', () => {
    const items = [{ item_id: 'result-1', item_name: 'Result 1', index: 0 }];

    render(
      <SearchAnalyticsEvents locale="en" query="climate" resultCount={1} items={items} />
    );

    expect(sendGTMEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'search', search_term: 'climate', language: 'en' })
    );
    expect(sendGTMEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'view_search_results',
        search_term: 'climate',
        results_count: 1,
      })
    );
  });

  it('does not track duplicate search events for the same query payload', () => {
    const items = [{ item_id: 'result-1', item_name: 'Result 1', index: 0 }];

    const props = { locale: 'en', query: 'climate', resultCount: 1, items };
    const { rerender } = render(<SearchAnalyticsEvents {...props} />);
    rerender(<SearchAnalyticsEvents {...props} />);

    expect(sendGTMEvent).toHaveBeenCalledTimes(2);
  });

  it('ignores clicks that are not on search result links', () => {
    render(
      <>
        <SearchAnalyticsEvents locale="en" query="aid" resultCount={1} items={[]} />
        <button type="button">Not a result</button>
      </>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(sendGTMEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event: 'select_item' })
    );
  });

  it('tracks select_item when a search result link is clicked', () => {
    render(
      <>
        <SearchAnalyticsEvents locale="en" query="aid" resultCount={1} items={[]} />
        <Link
          href="/reports/ch1"
          data-search-result="true"
          data-result-href="/reports/ch1"
          data-result-title="Chapter 1"
          data-result-index="0"
        >
          Chapter 1
        </Link>
      </>
    );

    fireEvent.click(document.querySelector('[data-search-result="true"]'));

    expect(sendGTMEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'select_item',
        search_term: 'aid',
        items: [{ item_id: '/reports/ch1', item_name: 'Chapter 1', index: 0 }],
      })
    );
  });
});
