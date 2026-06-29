const mockEmblaApi = {
  scrollPrev: jest.fn(),
  scrollNext: jest.fn(),
  scrollTo: jest.fn(),
  canScrollPrev: jest.fn(() => false),
  canScrollNext: jest.fn(() => true),
  selectedScrollSnap: jest.fn(() => 0),
  on: jest.fn((event, cb) => {
    if (event === 'init' || event === 'select') cb();
  }),
  off: jest.fn(),
  reInit: jest.fn(),
};

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [
    (node) => {
      if (node) {
        Object.defineProperty(node, 'clientWidth', { value: 800, configurable: true });
      }
    },
    mockEmblaApi,
  ],
}));

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
}));

import { render, screen, fireEvent, act } from '@testing-library/react';
import EmblaCarousel from '@/components/EmblaCarousel';

describe('EmblaCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockEmblaApi.scrollPrev.mockClear();
    mockEmblaApi.scrollNext.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders title and slides', () => {
    render(
      <EmblaCarousel locale="en" title="Featured">
        <div>Slide 1</div>
        <div>Slide 2</div>
      </EmblaCarousel>
    );

    expect(screen.getByRole('heading', { name: 'Featured' })).toBeInTheDocument();
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
  });

  it('shows navigation controls and handles prev/next clicks', async () => {
    render(
      <EmblaCarousel locale="en" title="Carousel">
        <div>Slide A</div>
        <div>Slide B</div>
        <div>Slide C</div>
      </EmblaCarousel>
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    const nextButton = screen.getByRole('button', { name: 'Next slide' });
    const prevButton = screen.getByRole('button', { name: 'Previous slide' });

    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();

    fireEvent.click(nextButton);

    expect(mockEmblaApi.scrollNext).toHaveBeenCalled();
    expect(prevButton).toBeDisabled();
  });

  it('renders controls at top when arrowsPosition is top', () => {
    const { container } = render(
      <EmblaCarousel locale="en" arrowsPosition="top">
        <div>One</div>
        <div>Two</div>
      </EmblaCarousel>
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    const section = container.querySelector('section');
    expect(section?.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders a single non-array child and fixed-width slides', () => {
    render(
      <EmblaCarousel locale="ar" slideWidth={300} showArrows={false}>
        <div>Only slide</div>
      </EmblaCarousel>
    );

    act(() => {
      jest.advanceTimersByTime(200);
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByText('Only slide')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
  });

  it('uses swapped chevrons for rtl locales', () => {
    render(
      <EmblaCarousel locale="ar">
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </EmblaCarousel>
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getAllByTestId('chevron-right').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('chevron-left').length).toBeGreaterThan(0);
  });
});
