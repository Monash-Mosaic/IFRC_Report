import { render, screen, fireEvent } from '@testing-library/react';
import TocClickTracker from '@/components/TocClickTracker';

const trackTocClick = jest.fn();

jest.mock('@/lib/gtm', () => ({
  trackTocClick: (...args) => trackTocClick(...args),
}));

describe('TocClickTracker', () => {
  beforeEach(() => {
    trackTocClick.mockClear();
  });

  it('renders nothing', () => {
    const { container } = render(<TocClickTracker />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ignores clicks outside the table of contents', () => {
    render(
      <>
        <TocClickTracker />
        <a href="#elsewhere">Elsewhere</a>
      </>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Elsewhere' }));
    expect(trackTocClick).not.toHaveBeenCalled();
  });

  it('tracks table of contents anchor clicks', () => {
    render(
      <>
        <TocClickTracker />
        <div data-ga-section="toc">
          <a href="#section-one">Section One</a>
        </div>
      </>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Section One' }));

    expect(trackTocClick).toHaveBeenCalledWith({
      heading: 'Section One',
      chapterUrl: expect.any(String),
    });
  });
});
