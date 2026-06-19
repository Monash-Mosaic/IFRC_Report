import { render, fireEvent } from '@testing-library/react';
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
          <a href="/discover">Discover</a>
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
