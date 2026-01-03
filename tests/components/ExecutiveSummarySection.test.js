import ExecutiveSummarySection from '@/components/landing-page/ExecutiveSummarySection';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, className, ...props }) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        data-testid="mock-image"
        data-fill={fill}
        {...props}
      />
    );
  };
});

// Mock next-intl navigation Link component
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, className, children, ...props }) => (
    <a
      href={href}
      className={className}
      data-testid="mock-link"
      {...props}
    >
      {children}
    </a>
  ),
}));

// Mock DownloadButton component
jest.mock('@/components/landing-page/DownloadButton', () => {
  return function MockDownloadButton({ children, className, variant, size, filePath, fileName, ...props }) {
    return (
      <button
        className={className || 'px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'}
        data-testid="mock-download-button"
        data-file-path={filePath}
        data-file-name={fileName}
        {...props}
      >
        {children}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          fill="currentColor" 
          className="w-5 h-5 flex-shrink-0" 
          viewBox="0 0 16 16"
        >
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
        </svg>
      </button>
    );
  };
});

// Sample test data matching the translation structure
const mockReportData = {
  landingPage: {
    executiveSummary: {
      title: 'Executive Summary Test Title',
      subtitle: 'Executive Summary Test Subtitle',
      description: 'This is a test description for the executive summary section that provides detailed information about the content.',
      buttonTexts: {
        read: 'Read Summary',
        download: 'Download PDF'
      }
    }
  }
};

const defaultProps = {
  reportData: mockReportData,
  locale: 'en'
};

describe('ExecutiveSummarySection', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders ExecutiveSummarySection with all content', () => {
    const { container } = render(<ExecutiveSummarySection {...defaultProps} />);
    
    // Should show title
    expect(screen.getByText('Executive Summary Test Title')).toBeInTheDocument();
    
    // Should show subtitle
    expect(screen.getByText('Executive Summary Test Subtitle')).toBeInTheDocument();
    
    // Should show description
    expect(screen.getByText('This is a test description for the executive summary section that provides detailed information about the content.')).toBeInTheDocument();
    
    // Should show both buttons
    expect(screen.getByText('Read Summary')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    
    // Should show image
    const image = screen.getByTestId('mock-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/wdr25/summary.png');
    expect(image).toHaveAttribute('alt', 'Executive Summary cover featuring a person in humanitarian context');
    
    expect(container).toMatchSnapshot();
  });

  it('renders with different locale', () => {
    const frenchProps = {
      ...defaultProps,
      locale: 'fr'
    };
    
    render(<ExecutiveSummarySection {...frenchProps} />);
    
    // Should still render content (locale is passed but doesn't affect rendering directly)
    expect(screen.getByText('Executive Summary Test Title')).toBeInTheDocument();
    expect(screen.getByText('Executive Summary Test Subtitle')).toBeInTheDocument();
  });

  it('renders with custom report data', () => {
    const customReportData = {
      landingPage: {
        executiveSummary: {
          title: 'Custom Title for Testing',
          subtitle: 'Custom Subtitle with Different Content',
          description: 'Custom description that is much longer and contains different information about the executive summary.',
          buttonTexts: {
            read: 'Lire le Résumé',
            download: 'Télécharger PDF'
          }
        }
      }
    };

    const customProps = {
      reportData: customReportData,
      locale: 'fr'
    };
    
    render(<ExecutiveSummarySection {...customProps} />);
    
    // Should show custom content
    expect(screen.getByText('Custom Title for Testing')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle with Different Content')).toBeInTheDocument();
    expect(screen.getByText('Custom description that is much longer and contains different information about the executive summary.')).toBeInTheDocument();
    expect(screen.getByText('Lire le Résumé')).toBeInTheDocument();
    expect(screen.getByText('Télécharger PDF')).toBeInTheDocument();
  });

  it('has correct button styling and behavior', () => {
    render(<ExecutiveSummarySection {...defaultProps} />);
    
    // Check read button styling (now a Link component)
    const readButton = screen.getByTestId('mock-link');
    expect(readButton).toHaveClass('px-6', 'py-3', 'bg-red-600', 'text-white', 'rounded-lg', 'font-medium', 'hover:bg-red-700', 'transition-colors', 'inline-flex', 'items-center', 'gap-2', 'whitespace-nowrap');
    expect(readButton).toHaveAttribute('href', '/reports/wdr25/chapter-02');
    expect(readButton).toHaveTextContent('Read Summary');
    
    // Check download button styling (now using DownloadButton component)
    const downloadButton = screen.getByTestId('mock-download-button');
    expect(downloadButton).toHaveClass('border-2', 'border-red-600', 'text-red-600', 'hover:bg-red-600', 'hover:text-white', 'rounded-lg', 'font-medium', 'transition-colors', 'inline-flex', 'items-center', 'gap-2', 'whitespace-nowrap');
    expect(downloadButton).toHaveTextContent('Download PDF');
    
    // Buttons should be clickable (even though no onClick handlers are defined)
    fireEvent.click(readButton);
    fireEvent.click(downloadButton);
    
    // Should not crash when clicked
    expect(readButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<ExecutiveSummarySection {...defaultProps} />);
    
    // Should have main section with grid layout
    const section = container.querySelector('section');
    expect(section).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-8', 'lg:gap-12', 'items-center');
    
    // Should have text content container
    const textContainer = container.querySelector('.flex.flex-col.h-full');
    expect(textContainer).toBeInTheDocument();
    
    // Should have image container with correct aspect ratio
    const imageContainer = container.querySelector('.relative.aspect-\\[3\\/4\\]');
    expect(imageContainer).toBeInTheDocument();
    expect(imageContainer).toHaveClass('rounded-2xl', 'overflow-hidden', 'bg-gray-200');
  });

  it('has correct image properties', () => {
    render(<ExecutiveSummarySection {...defaultProps} />);
    
    const image = screen.getByTestId('mock-image');
    
    // Should have correct image attributes
    expect(image).toHaveAttribute('src', '/wdr25/summary.png');
    expect(image).toHaveAttribute('alt', 'Executive Summary cover featuring a person in humanitarian context');
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveClass('object-cover');
  });

  it('handles missing or malformed data gracefully', () => {
    const malformedData = {
      landingPage: {
        executiveSummary: {
          title: '',
          subtitle: '',
          description: '',
          buttonTexts: {
            read: '',
            download: ''
          }
        }
      }
    };

    const malformedProps = {
      reportData: malformedData,
      locale: 'en'
    };
    
    // Should not crash with empty strings
    expect(() => {
      render(<ExecutiveSummarySection {...malformedProps} />);
    }).not.toThrow();
    
    // Image should still render
    expect(screen.getByTestId('mock-image')).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(<ExecutiveSummarySection {...defaultProps} />);
    
    // Should use proper heading hierarchy
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Executive Summary Test Title');
    
    const h3 = screen.getByRole('heading', { level: 3 });
    expect(h3).toHaveTextContent('Executive Summary Test Subtitle');
    
    // Should have one button (download) and one link (read)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('Download PDF');
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('Read Summary');
    expect(links[0]).toHaveAttribute('href', '/reports/wdr25/chapter-02');
  });

  it('uses flexbox layout correctly for content positioning', () => {
    const { container } = render(<ExecutiveSummarySection {...defaultProps} />);
    
    // Text container should use flex layout
    const textContainer = container.querySelector('.flex.flex-col.h-full');
    expect(textContainer).toBeInTheDocument();
    
    // Content area should have flex-1 to take available space
    const contentArea = container.querySelector('.space-y-6.flex-1');
    expect(contentArea).toBeInTheDocument();
    
    // Button area should have margin top
    const buttonArea = container.querySelector('.flex.gap-4.mt-8');
    expect(buttonArea).toBeInTheDocument();
  });
});