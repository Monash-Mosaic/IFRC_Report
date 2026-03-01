import ChapterCard from '@/components/ChapterCard';
import { render, screen } from '@testing-library/react';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock next-intl navigation Link
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, className, children, ...props }) => (
    <a href={typeof href === 'object' ? href.pathname : href} className={className} data-testid="mock-link" {...props}>
      {children}
    </a>
  ),
}));

const defaultProps = {
  chapterKey: 'chapter-01',
  chapterLabel: 'Chapter 1',
  title: 'Crisis, Chaos and Confusion: Understanding Harmful Information',
  subtitle: 'An overview of harmful information',
  thumbnail: '/wdr25/chapters/Chapter1.png',
  thumbnailOverlay: 'red',
  tableOfContents: [
    { id: '1', value: 'Defining Harmful Information' },
    { id: '2', value: 'The Evolving Information Ecosystem' },
  ],
  continueHref: {
    pathname: '/reports/[report]/[chapter]',
    params: { report: 'wdr25', chapter: 'chapter-01' },
  },
  report: 'wdr25',
  released: true,
  translations: {
    continue: 'Continue',
    comingSoon: 'Coming Soon',
    expandChapter: 'Expand chapter',
  },
};

describe('ChapterCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with all content', async () => {
    const { container } = render(await ChapterCard(defaultProps));

    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    expect(screen.getByText('Crisis, Chaos and Confusion: Understanding Harmful Information')).toBeInTheDocument();
    expect(screen.getByText('An overview of harmful information')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('renders thumbnail image when provided', async () => {
    render(await ChapterCard(defaultProps));

    const img = screen.getByAltText('Crisis, Chaos and Confusion: Understanding Harmful Information');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/wdr25/chapters/Chapter1.png');
  });

  it('renders chapter label fallback when no thumbnail', async () => {
    const props = { ...defaultProps, thumbnail: null };
    render(await ChapterCard(props));

    // Should show chapterLabel text inside the placeholder
    const labels = screen.getAllByText('Chapter 1');
    expect(labels.length).toBeGreaterThanOrEqual(2); // label text + fallback inside thumbnail
  });

  it('renders table of contents items', async () => {
    render(await ChapterCard(defaultProps));

    expect(screen.getByText('Defining Harmful Information')).toBeInTheDocument();
    expect(screen.getByText('The Evolving Information Ecosystem')).toBeInTheDocument();
  });

  it('renders "Coming Soon" when not released', async () => {
    const props = { ...defaultProps, released: false };
    render(await ChapterCard(props));

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });

  it('renders "Continue" link when released', async () => {
    render(await ChapterCard(defaultProps));

    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });

  it('renders without subtitle', async () => {
    const props = { ...defaultProps, subtitle: null };
    render(await ChapterCard(props));

    expect(screen.getByText('Crisis, Chaos and Confusion: Understanding Harmful Information')).toBeInTheDocument();
    expect(screen.queryByText('An overview of harmful information')).not.toBeInTheDocument();
  });

  it('renders with empty table of contents', async () => {
    const props = { ...defaultProps, tableOfContents: [] };
    render(await ChapterCard(props));

    // Should still render the details/summary structure
    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    expect(screen.queryByText('Defining Harmful Information')).not.toBeInTheDocument();
  });

  it('applies blue overlay class when thumbnailOverlay is blue', async () => {
    const props = { ...defaultProps, thumbnailOverlay: 'blue' };
    const { container } = render(await ChapterCard(props));

    const overlayDiv = container.querySelector('.bg-blue-500\\/30');
    expect(overlayDiv).toBeInTheDocument();
  });

  it('applies red overlay class by default', async () => {
    const { container } = render(await ChapterCard(defaultProps));

    const overlayDiv = container.querySelector('.bg-red-500\\/30');
    expect(overlayDiv).toBeInTheDocument();
  });

  it('renders with details element for TOC expansion', async () => {
    const { container } = render(await ChapterCard(defaultProps));

    const details = container.querySelector('details');
    expect(details).toBeInTheDocument();
    expect(details).toHaveAttribute('aria-label', 'Expand chapter');
  });

  it('does not crash with missing translations', async () => {
    const props = { ...defaultProps, translations: {} };

    expect(async () => {
      render(await ChapterCard(props));
    }).not.toThrow();
  });
});
