import { render, fireEvent } from '@testing-library/react';
import Link from 'next/link';
import OutboundLinkTracker from '@/components/OutboundLinkTracker';

const trackOutboundClick = jest.fn();
const trackNavClick = jest.fn();

jest.mock('@/lib/gtm', () => ({
  trackOutboundClick: (...args) => trackOutboundClick(...args),
  trackNavClick: (...args) => trackNavClick(...args),
}));

describe('OutboundLinkTracker', () => {
  beforeEach(() => {
    trackOutboundClick.mockClear();
    trackNavClick.mockClear();
  });

  it('renders nothing', () => {
    const { container } = render(<OutboundLinkTracker />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ignores clicks that are not links', () => {
    render(
      <>
        <OutboundLinkTracker />
        <button type="button">Not a link</button>
      </>
    );

    fireEvent.click(document.querySelector('button'));
    expect(trackOutboundClick).not.toHaveBeenCalled();
    expect(trackNavClick).not.toHaveBeenCalled();
  });

  it('tracks external link clicks', () => {
    render(
      <>
        <OutboundLinkTracker />
        <div data-ga-section="footer">
          <a href="https://external.example.com/page">External</a>
        </div>
      </>
    );

    fireEvent.click(document.querySelector('a[href="https://external.example.com/page"]'));

    expect(trackOutboundClick).toHaveBeenCalledWith({
      url: 'https://external.example.com/page',
      originSection: 'footer',
    });
  });

  it('tracks internal navigation link clicks', () => {
    render(
      <>
        <OutboundLinkTracker />
        <header>
          <Link href="/discover">Discover</Link>
        </header>
      </>
    );

    fireEvent.click(document.querySelector('a[href="/discover"]'));

    expect(trackNavClick).toHaveBeenCalledWith({
      linkText: 'Discover',
      linkUrl: '/discover',
      section: 'navigation',
    });
  });
});
