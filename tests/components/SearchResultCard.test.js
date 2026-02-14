import SearchResultCard, { convertHighlightsReactComponent } from '@/components/SearchResultCard';
import { render, screen } from '@testing-library/react';

// Mock next-intl navigation Link component
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, className, children, ...props }) => (
    <a href={href} className={className} data-testid="mock-link" {...props}>
      {children}
    </a>
  ),
}));

const defaultProps = {
  title: 'Test Chapter Title: Understanding Humanitarian Response',
  highlight:
    'This is a test excerpt that provides a brief description of the chapter content. It should be truncated if too long...',
  href: '/reports/wdr25/chapter-02',
};

describe('convertHighlightsReactComponent', () => {
  it('correctly converts highlighted text with <em> tags', () => {
    const input = 'This is a <em>highlighted</em> word in the text.';
    const result = convertHighlightsReactComponent(input);
    render(<>{result}</>);
    const highlightedElement = screen.getByText('highlighted');
    // Should return an array of React nodes
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    expect(highlightedElement).toBeInTheDocument()
  });

});

describe('SearchResultCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SearchResultCard with all content', () => {
    const { container } = render(<SearchResultCard {...defaultProps} />);

    // Should show title
    expect(
      screen.getByText('Test Chapter Title: Understanding Humanitarian Response')
    ).toBeInTheDocument();

    // Should show excerpt
    expect(
      screen.getByText(
        'This is a test excerpt that provides a brief description of the chapter content. It should be truncated if too long...'
      )
    ).toBeInTheDocument();

    // Should render as a link
    const link = screen.getByTestId('mock-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/reports/wdr25/chapter-02');

    expect(container).toMatchSnapshot();
  });

  it('renders with different content', () => {
    const customProps = {
      title: 'Harmful Information and the Erosion of Trust in Humanitarian Response',
      highlight:
        'Confirmation Bias refers to the tendency to seek out, favour and recall information that supports our existing beliefs...',
      href: '/reports/wdr25/chapter-01',
    };

    render(<SearchResultCard {...customProps} />);

    expect(
      screen.getByText('Harmful Information and the Erosion of Trust in Humanitarian Response')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Confirmation Bias refers to the tendency to seek out, favour and recall information that supports our existing beliefs...'
      )
    ).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<SearchResultCard {...defaultProps} />);

    // Should have article element with correct classes
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass(
      'bg-gray-100',
      'rounded-lg',
      'p-6',
      'hover:bg-gray-200',
      'transition-colors',
      'cursor-pointer'
    );

    // Title should have correct classes
    const title = screen.getByText('Test Chapter Title: Understanding Humanitarian Response');
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-lg', 'font-bold', 'text-gray-900', 'mb-3', 'line-clamp-2');

    // Excerpt should have correct classes
    const excerpt = screen.getByText(/This is a test excerpt/);
    const excerptParagraph = excerpt.closest('p');
    expect(excerptParagraph).toBeInTheDocument();
    expect(excerptParagraph.tagName).toBe('P');
    expect(excerptParagraph).toHaveClass(
      'text-sm',
      'text-gray-600',
      'leading-relaxed',
      'line-clamp-3'
    );
  });

  it('wraps content in a clickable link', () => {
    render(<SearchResultCard {...defaultProps} />);

    const link = screen.getByTestId('mock-link');
    expect(link).toHaveClass('block');

    // Article should be inside the link
    const article = link.querySelector('article');
    expect(article).toBeInTheDocument();
  });

  it('handles long titles with line-clamp', () => {
    const longTitleProps = {
      ...defaultProps,
      title:
        'This is an extremely long title that would normally wrap onto multiple lines and should be truncated by the line-clamp-2 CSS class to show only two lines of text',
    };

    render(<SearchResultCard {...longTitleProps} />);

    const title = screen.getByText(/This is an extremely long title/);
    expect(title).toHaveClass('line-clamp-2');
  });

  it('handles long excerpts with line-clamp', () => {
    const longExcerptProps = {
      ...defaultProps,
      highlight:
        'This is an extremely long excerpt that would normally take up a lot of space. It contains detailed information about the chapter content and should be truncated to show only three lines of text to maintain a clean and consistent card layout.',
    };

    render(<SearchResultCard {...longExcerptProps} />);

    const excerpt = screen.getByText(/This is an extremely long excerpt/);
    expect(excerpt.closest('p')).toHaveClass('line-clamp-3');
  });

  it('has proper semantic HTML structure', () => {
    render(<SearchResultCard {...defaultProps} />);

    // Should use article element
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    // Should use h3 for title
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Chapter Title: Understanding Humanitarian Response');

    // Should have a link
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  it('handles empty strings gracefully', () => {
    const emptyProps = {
      title: '',
      highlight: '',
      href: '/reports/wdr25/chapter-02',
    };

    // Should not crash with empty strings
    expect(() => {
      render(<SearchResultCard {...emptyProps} />);
    }).not.toThrow();

    // Article should still render
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
