import ReportDetailClient from '@/components/ReportDetailClient';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the storage functions
const mockGetBookmarks = jest.fn();
const mockToggleBookmark = jest.fn();

jest.mock('@/lib/storage', () => ({
  getBookmarks: () => mockGetBookmarks(),
  toggleBookmark: (sectionName) => mockToggleBookmark(sectionName),
}));

// Mock the navigation Link component
jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Sample test data
const mockSections = [
  {
    name: 'Chapter 1: Introduction',
    slug: 'chapter-1',
    progress: 75,
    summary: ['Overview of the report', 'Key findings introduction'],
  },
  {
    name: 'Chapter 2: Methodology',
    slug: 'chapter-2',
    progress: 50,
    summary: ['Research approach', 'Data collection methods'],
  },
  {
    name: 'Chapter 3: Results',
    slug: 'chapter-3',
    progress: 0,
    summary: ['Main findings', 'Statistical analysis'],
  },
];

const defaultProps = {
  sections: mockSections,
  reportTitle: 'World Disasters Report 2025',
  decodedReport: 'wdr25',
  translations: {
    backToDocuments: 'Back to Documents',
    tableOfContent: 'Table of Contents',
    bookmark: 'Bookmarks',
    noBookmarks: 'No bookmarks yet',
    noBookmarksHint: 'Click the bookmark icon to save sections',
    continue: 'Continue',
  },
};

describe('ReportDetailClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBookmarks.mockResolvedValue(new Set());
    mockToggleBookmark.mockResolvedValue(new Set());
  });

  it('renders ReportDetailClient with all sections', async () => {
    const { container } = render(<ReportDetailClient {...defaultProps} />);

    // Check title renders
    expect(screen.getByText('World Disasters Report 2025')).toBeInTheDocument();

    // Check all sections render
    expect(screen.getByText('Chapter 1: Introduction')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2: Methodology')).toBeInTheDocument();
    expect(screen.getByText('Chapter 3: Results')).toBeInTheDocument();

    // Check back button renders
    expect(screen.getByText('Back to Documents')).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('renders navigation tabs for Table of Contents and Bookmarks', () => {
    render(<ReportDetailClient {...defaultProps} />);

    expect(screen.getByText('Table of Contents')).toBeInTheDocument();
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
  });

  it('displays progress bars for each section', () => {
    render(<ReportDetailClient {...defaultProps} />);

    // Check progress percentages are displayed (use getAllByText for duplicates)
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders Continue links for each section', () => {
    render(<ReportDetailClient {...defaultProps} />);

    const continueLinks = screen.getAllByText('Continue');
    expect(continueLinks).toHaveLength(3);

    // Check link hrefs
    expect(continueLinks[0].closest('a')).toHaveAttribute('href', './wdr25/chapter-1');
    expect(continueLinks[1].closest('a')).toHaveAttribute('href', './wdr25/chapter-2');
    expect(continueLinks[2].closest('a')).toHaveAttribute('href', './wdr25/chapter-3');
  });

  it('expands section to show summary when chevron is clicked', () => {
    render(<ReportDetailClient {...defaultProps} />);

    // Summary should not be visible initially
    expect(screen.queryByText('Overview of the report')).not.toBeInTheDocument();

    // Find and click the chevron for first section
    const chevrons = document.querySelectorAll('.lucide-chevron-down');
    fireEvent.click(chevrons[0]);

    // Summary should now be visible
    expect(screen.getByText('Overview of the report')).toBeInTheDocument();
    expect(screen.getByText('Key findings introduction')).toBeInTheDocument();
  });

  it('collapses expanded section when chevron is clicked again', () => {
    render(<ReportDetailClient {...defaultProps} />);

    const chevrons = document.querySelectorAll('.lucide-chevron-down');

    // Expand
    fireEvent.click(chevrons[0]);
    expect(screen.getByText('Overview of the report')).toBeInTheDocument();

    // Collapse
    fireEvent.click(chevrons[0]);
    expect(screen.queryByText('Overview of the report')).not.toBeInTheDocument();
  });

  it('switches to bookmarks tab when bookmark button is clicked', async () => {
    render(<ReportDetailClient {...defaultProps} />);

    // Initially on TOC tab, all sections visible
    expect(screen.getByText('Chapter 1: Introduction')).toBeInTheDocument();

    // Click bookmarks tab
    fireEvent.click(screen.getByText('Bookmarks'));

    // Should show empty bookmarks message
    expect(screen.getByText('No bookmarks yet')).toBeInTheDocument();
    expect(screen.getByText('Click the bookmark icon to save sections')).toBeInTheDocument();
  });

  it('toggles bookmark when bookmark icon is clicked', async () => {
    const newBookmarks = new Set(['Chapter 1: Introduction']);
    mockToggleBookmark.mockResolvedValue(newBookmarks);

    render(<ReportDetailClient {...defaultProps} />);

    // Find bookmark button for first section
    const bookmarkButton = screen.getByLabelText('Add bookmark for Chapter 1: Introduction');
    fireEvent.click(bookmarkButton);

    await waitFor(() => {
      expect(mockToggleBookmark).toHaveBeenCalledWith('Chapter 1: Introduction');
    });
  });

  it('shows bookmarked sections in bookmark tab', async () => {
    // Start with a bookmarked section
    mockGetBookmarks.mockResolvedValue(new Set(['Chapter 2: Methodology']));

    render(<ReportDetailClient {...defaultProps} />);

    // Wait for bookmarks to load
    await waitFor(() => {
      expect(mockGetBookmarks).toHaveBeenCalled();
    });

    // Switch to bookmarks tab
    fireEvent.click(screen.getByText('Bookmarks'));

    // Only bookmarked section should be visible
    await waitFor(() => {
      expect(screen.getByText('Chapter 2: Methodology')).toBeInTheDocument();
    });
  });

  it('loads bookmarks on mount', async () => {
    const initialBookmarks = new Set(['Chapter 1: Introduction', 'Chapter 3: Results']);
    mockGetBookmarks.mockResolvedValue(initialBookmarks);

    render(<ReportDetailClient {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetBookmarks).toHaveBeenCalled();
    });
  });

  it('switches to bookmark tab after bookmarking a section', async () => {
    const newBookmarks = new Set(['Chapter 1: Introduction']);
    mockToggleBookmark.mockResolvedValue(newBookmarks);

    render(<ReportDetailClient {...defaultProps} />);

    // Initially on TOC tab - check parent button has text-black class
    const tocButton = screen.getByText('Table of Contents').closest('button');
    expect(tocButton).toHaveClass('text-black');

    // Bookmark a section
    const bookmarkButton = screen.getByLabelText('Add bookmark for Chapter 1: Introduction');
    fireEvent.click(bookmarkButton);

    await waitFor(() => {
      // Should switch to bookmark tab
      const bookmarkTabButton = screen.getByText('Bookmarks').closest('button');
      expect(bookmarkTabButton).toHaveClass('text-black');
    });
  });

  it('renders back link with correct href', () => {
    render(<ReportDetailClient {...defaultProps} />);

    const backLink = screen.getByText('Back to Documents').closest('a');
    expect(backLink).toHaveAttribute('href', './');
  });

  it('displays overall progress bar', () => {
    render(<ReportDetailClient {...defaultProps} />);

    // Check for 50% overall progress
    const progressTexts = screen.getAllByText('50%');
    expect(progressTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('updates bookmark icon appearance when bookmarked', async () => {
    mockGetBookmarks.mockResolvedValue(new Set(['Chapter 1: Introduction']));

    render(<ReportDetailClient {...defaultProps} />);

    await waitFor(() => {
      const removeBookmarkButton = screen.getByLabelText(
        'Remove bookmark for Chapter 1: Introduction'
      );
      expect(removeBookmarkButton).toBeInTheDocument();
    });
  });

  it('can expand multiple sections simultaneously', () => {
    render(<ReportDetailClient {...defaultProps} />);

    const chevrons = document.querySelectorAll('.lucide-chevron-down');

    // Expand first section
    fireEvent.click(chevrons[0]);
    expect(screen.getByText('Overview of the report')).toBeInTheDocument();

    // Expand second section
    fireEvent.click(chevrons[1]);
    expect(screen.getByText('Research approach')).toBeInTheDocument();

    // Both should still be visible
    expect(screen.getByText('Overview of the report')).toBeInTheDocument();
    expect(screen.getByText('Research approach')).toBeInTheDocument();
  });
});
