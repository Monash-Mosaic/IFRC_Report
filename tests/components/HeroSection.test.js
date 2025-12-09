import HeroSection from '@/components/landing-page/HeroSection';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, className, priority, ...props }) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        data-testid="mock-image"
        data-fill={fill}
        data-priority={priority}
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

// Sample test data matching the translation structure
const mockReportData = {
  landingPage: {
    heroSection: {
      title: 'World Disasters Report 2025 Test Title',
      description: 'This is a comprehensive test description for the hero section that provides detailed information about the World Disasters Report and its importance in humanitarian work.',
      buttonTexts: {
        read: 'Read Report',
        download: 'Download PDF',
        share: 'Share Report'
      }
    }
  }
};

const defaultProps = {
  reportData: mockReportData,
  locale: 'en'
};

describe('HeroSection', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders HeroSection with all content', () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    
    // Should show title
    expect(screen.getByText('World Disasters Report 2025 Test Title')).toBeInTheDocument();
    
    // Should show description
    expect(screen.getByText('This is a comprehensive test description for the hero section that provides detailed information about the World Disasters Report and its importance in humanitarian work.')).toBeInTheDocument();
    
    // Should show all three buttons/links
    expect(screen.getByText('Read Report')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByText('Share Report')).toBeInTheDocument();
    
    // Should show hero image
    const image = screen.getByTestId('mock-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/wdr25/hero.jpg');
    expect(image).toHaveAttribute('alt', 'World Disasters Report hero image showing humanitarian workers in action');
    expect(image).toHaveAttribute('data-priority', 'true');
    
    expect(container).toMatchSnapshot();
  });

  it('renders with different locale', () => {
    const frenchProps = {
      ...defaultProps,
      locale: 'fr'
    };
    
    render(<HeroSection {...frenchProps} />);
    
    // Should still render content (locale is passed but doesn't affect rendering directly)
    expect(screen.getByText('World Disasters Report 2025 Test Title')).toBeInTheDocument();
    expect(screen.getByText('This is a comprehensive test description for the hero section that provides detailed information about the World Disasters Report and its importance in humanitarian work.')).toBeInTheDocument();
  });

  it('renders with custom report data', () => {
    const customReportData = {
      landingPage: {
        heroSection: {
          title: 'Custom Hero Title for Testing Purposes',
          description: 'Custom hero description with different content and longer text to test the component rendering capabilities.',
          buttonTexts: {
            read: 'Lire le Rapport',
            download: 'Télécharger PDF',
            share: 'Partager Rapport'
          }
        }
      }
    };

    const customProps = {
      reportData: customReportData,
      locale: 'fr'
    };
    
    render(<HeroSection {...customProps} />);
    
    // Should show custom content
    expect(screen.getByText('Custom Hero Title for Testing Purposes')).toBeInTheDocument();
    expect(screen.getByText('Custom hero description with different content and longer text to test the component rendering capabilities.')).toBeInTheDocument();
    expect(screen.getByText('Lire le Rapport')).toBeInTheDocument();
    expect(screen.getByText('Télécharger PDF')).toBeInTheDocument();
    expect(screen.getByText('Partager Rapport')).toBeInTheDocument();
  });

  it('has correct Link component for read button', () => {
    render(<HeroSection {...defaultProps} />);
    
    // Check that read button is a Link component with correct href
    const readLink = screen.getByTestId('mock-link');
    expect(readLink).toBeInTheDocument();
    expect(readLink).toHaveAttribute('href', '/reports/wdr25');
    expect(readLink).toHaveTextContent('Read Report');
    
    // Should have correct Link styling
    expect(readLink).toHaveClass('px-6', 'py-3', 'bg-red-600', 'text-white', 'rounded-lg', 'font-medium', 'hover:bg-red-700', 'transition-colors', 'inline-block', 'text-center');
  });

  it('has correct button styling and behavior', () => {
    render(<HeroSection {...defaultProps} />);
    
    // Check download button styling
    const downloadButton = screen.getByText('Download PDF');
    expect(downloadButton).toHaveClass('px-6', 'py-3', 'bg-blue-950', 'text-white', 'rounded-lg', 'font-medium', 'hover:bg-blue-800', 'transition-colors');
    
    // Check share button styling
    const shareButton = screen.getByText('Share Report');
    expect(shareButton).toHaveClass('px-6', 'py-3', 'bg-cyan-200', 'text-blue-950', 'rounded-lg', 'font-medium', 'hover:bg-cyan-50', 'transition-colors');
    
    // Buttons should be clickable (even though no onClick handlers are defined)
    fireEvent.click(downloadButton);
    fireEvent.click(shareButton);
    
    // Should not crash when clicked
    expect(downloadButton).toBeInTheDocument();
    expect(shareButton).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    
    // Should have main section with space-y-8
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-8');
    
    // Should have text content container
    const textContainer = container.querySelector('.text-left.space-y-6');
    expect(textContainer).toBeInTheDocument();
    
    // Should have button container with correct flex layout
    const buttonContainer = container.querySelector('.flex.flex-col.sm\\:flex-row.gap-4.items-start');
    expect(buttonContainer).toBeInTheDocument();
    
    // Should have image container with correct aspect ratio
    const imageContainer = container.querySelector('.relative.w-full.aspect-video');
    expect(imageContainer).toBeInTheDocument();
    expect(imageContainer).toHaveClass('rounded-2xl', 'overflow-hidden', 'bg-gray-200');
  });

  it('has correct image properties', () => {
    render(<HeroSection {...defaultProps} />);
    
    const image = screen.getByTestId('mock-image');
    
    // Should have correct image attributes
    expect(image).toHaveAttribute('src', '/wdr25/hero.jpg');
    expect(image).toHaveAttribute('alt', 'World Disasters Report hero image showing humanitarian workers in action');
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveAttribute('data-priority', 'true');
    expect(image).toHaveClass('object-cover');
  });

  it('handles missing or malformed data gracefully', () => {
    const malformedData = {
      landingPage: {
        heroSection: {
          title: '',
          description: '',
          buttonTexts: {
            read: '',
            download: '',
            share: ''
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
      render(<HeroSection {...malformedProps} />);
    }).not.toThrow();
    
    // Image should still render
    expect(screen.getByTestId('mock-image')).toBeInTheDocument();
    
    // Link should still render (even with empty text)
    expect(screen.getByTestId('mock-link')).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(<HeroSection {...defaultProps} />);
    
    // Should use proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('World Disasters Report 2025 Test Title');
    expect(h1).toHaveClass('text-4xl', 'md:text-6xl', 'font-bold', 'text-gray-900', 'leading-tight');
    
    // Should have buttons with proper role
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // Download and Share buttons (Read is a Link)
    expect(buttons[0]).toHaveTextContent('Download PDF');
    expect(buttons[1]).toHaveTextContent('Share Report');
    
    // Should have link with proper role
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Read Report');
    expect(link).toHaveAttribute('href', '/reports/wdr25');
  });

  it('has responsive text sizing', () => {
    render(<HeroSection {...defaultProps} />);
    
    // Title should have responsive classes
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-4xl', 'md:text-6xl');
    
    // Description should have responsive classes
    const description = screen.getByText(/This is a comprehensive test description/);
    expect(description).toHaveClass('text-lg', 'md:text-xl', 'text-gray-700', 'max-w-4xl', 'leading-relaxed');
  });

  it('has responsive button layout', () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    
    // Button container should use responsive flex direction
    const buttonContainer = container.querySelector('.flex.flex-col.sm\\:flex-row.gap-4.items-start');
    expect(buttonContainer).toBeInTheDocument();
    
    // Should stack vertically on mobile, horizontally on small screens+
    expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
  });

  it('handles click events on buttons', () => {
    render(<HeroSection {...defaultProps} />);
    
    const downloadButton = screen.getByText('Download PDF');
    const shareButton = screen.getByText('Share Report');
    const readLink = screen.getByText('Read Report');
    
    // Should be able to click all interactive elements without errors
    expect(() => {
      fireEvent.click(downloadButton);
      fireEvent.click(shareButton);
      fireEvent.click(readLink);
    }).not.toThrow();
    
    // Elements should still be in document after clicking
    expect(downloadButton).toBeInTheDocument();
    expect(shareButton).toBeInTheDocument();
    expect(readLink).toBeInTheDocument();
  });
});