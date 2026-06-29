import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareButton from '@/components/ShareButton';

const trackShare = jest.fn();

jest.mock('@/lib/gtm', () => ({
  trackShare: (...args) => trackShare(...args),
}));

jest.mock('lucide-react', () => ({
  Share: () => <span data-testid="share-icon" />,
}));

describe('ShareButton', () => {
  beforeEach(() => {
    trackShare.mockClear();
    delete navigator.share;
    delete navigator.clipboard;
  });

  it('renders share button with label', () => {
    render(<ShareButton label="Share" url="https://example.com/page" title="Page title" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByTestId('share-icon')).toBeInTheDocument();
  });

  it('tracks share and uses Web Share API when available', async () => {
    navigator.share = jest.fn().mockResolvedValue(undefined);

    render(<ShareButton label="Share" url="https://example.com/share" title="Share title" />);
    fireEvent.click(screen.getByRole('button'));

    expect(trackShare).toHaveBeenCalledWith({
      platform: 'web_share',
      url: 'https://example.com/share',
      text: 'Share title',
    });

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Share title',
        url: 'https://example.com/share',
      });
    });
  });

  it('uses window location when url prop is omitted', async () => {
    navigator.share = jest.fn().mockResolvedValue(undefined);

    render(<ShareButton label="Share" title="Current page" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Current page',
        url: window.location.href,
      });
    });
  });

  it('swallows share cancellation errors', async () => {
    navigator.share = jest.fn().mockRejectedValue(new Error('cancelled'));

    render(<ShareButton label="Share" url="https://example.com/share" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalled();
    });
  });

  it('copies URL to clipboard when Web Share API is unavailable', async () => {
    navigator.clipboard = { writeText: jest.fn().mockResolvedValue(undefined) };

    render(<ShareButton label="Share" url="https://example.com/copy" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/copy');
    });
  });
});
