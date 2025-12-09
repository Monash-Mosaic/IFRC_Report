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
    
    // Check read button styling
    const readButton = screen.getByText('Read Summary');
    expect(readButton).toHaveClass('px-6', 'py-3', 'bg-red-600', 'text-white', 'rounded-lg', 'font-medium', 'hover:bg-red-700', 'transition-colors');
    
    // Check download button styling
    const downloadButton = screen.getByText('Download PDF');
    expect(downloadButton).toHaveClass('px-6', 'py-3', 'bg-blue-900', 'text-white', 'rounded-lg', 'font-medium', 'hover:bg-blue-800', 'transition-colors');
    
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
    
    // Should have buttons with proper role
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Read Summary');
    expect(buttons[1]).toHaveTextContent('Download PDF');
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