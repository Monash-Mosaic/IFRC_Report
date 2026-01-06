import HeroSection from '@/components/landing-page/HeroSection';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next-intl hooks used by the component
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    const translations = {
      'Home.landingPage.heroSection.title': 'World Disasters Report 2025 Test Title',
      'Home.landingPage.heroSection.description': 'This is a comprehensive test description for the hero section that provides detailed information about the World Disasters Report and its importance in humanitarian work.',
      'Home.landingPage.heroSection.buttonTexts.read': 'Read Report',
      'Home.landingPage.heroSection.buttonTexts.download': 'Download PDF',
      'Home.landingPage.heroSection.buttonTexts.share': 'Share Report'
    };
    
    // Check if we're testing with French locale (for custom content test)
    if (key === 'title' && mockHeroSection?.customContent?.title) {
      return mockHeroSection.customContent.title;
    }
    if (key === 'description' && mockHeroSection?.customContent?.description) {
      return mockHeroSection.customContent.description;
    }
    if (key === 'buttonTexts.read' && mockHeroSection?.customContent?.buttonTexts?.read) {
      return mockHeroSection.customContent.buttonTexts.read;
    }
    if (key === 'buttonTexts.download' && mockHeroSection?.customContent?.buttonTexts?.download) {
      return mockHeroSection.customContent.buttonTexts.download;
    }
    if (key === 'buttonTexts.share' && mockHeroSection?.customContent?.buttonTexts?.share) {
      return mockHeroSection.customContent.buttonTexts.share;
    }
    
    return translations[`${namespace}.${key}`] || key;
  },
}));

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

const defaultProps = {
  locale: 'en'
};

// Global variable to control custom content in tests
let mockHeroSection = null;

describe('HeroSection', () => {
  beforeEach(() => {
    mockHeroSection = null;
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
    expect(screen.getAllByText('Download PDF')).toHaveLength(2); // Two instances for mobile/desktop
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
    // Set up custom mock content
    mockHeroSection = {
      customContent: {
        title: 'Custom Hero Title for Testing Purposes',
        description: 'Custom hero description with different content and longer text to test the component rendering capabilities.',
        buttonTexts: {
          read: 'Lire le Rapport',
          download: 'Télécharger PDF',
          share: 'Partager Rapport'
        }
      }
    };

    const customProps = {
      locale: 'fr'
    };
    
    render(<HeroSection {...customProps} />);
    
    // Should show custom content
    expect(screen.getByText('Custom Hero Title for Testing Purposes')).toBeInTheDocument();
    expect(screen.getByText('Custom hero description with different content and longer text to test the component rendering capabilities.')).toBeInTheDocument();
    expect(screen.getByText('Lire le Rapport')).toBeInTheDocument();
    expect(screen.getAllByText('Télécharger PDF')).toHaveLength(2); // Two instances for mobile/desktop
    expect(screen.getByText('Partager Rapport')).toBeInTheDocument();
  });

  it('has correct Link component for read button', () => {
    render(<HeroSection {...defaultProps} />);
    
    // Check that read button is a Link component with correct href
    const readLink = screen.getByTestId('mock-link');
    expect(readLink).toBeInTheDocument();
    expect(readLink).toHaveAttribute('href', '/reports/wdr25');
    expect(readLink).toHaveTextContent('Read Report');
    
    // Should have correct Link styling with responsive classes
    expect(readLink).toHaveClass('flex-1', 'md:flex-none', 'px-3', 'md:px-6', 'py-2', 'md:py-3', 'bg-red-600', 'text-white', 'rounded-lg', 'font-medium', 'hover:bg-red-700', 'transition-colors', 'inline-flex', 'items-center', 'justify-center', 'gap-1', 'md:gap-2', 'whitespace-nowrap');
  });

  it('has correct button styling and behavior', () => {
    render(<HeroSection {...defaultProps} />);
    
    // Check download button styling (now using DownloadButton component)
    const downloadButton = screen.getByTestId('mock-download-button');
    expect(downloadButton).toHaveClass('w-full', 'h-full', 'px-3', 'md:px-6', 'py-2', 'md:py-3', 'text-xs', 'md:text-base');
    
    // Check share button styling
    const shareSpan = screen.getByText('Share Report');
    const shareButton = shareSpan.closest('button');
    expect(shareButton).toHaveClass('w-12', 'md:w-auto', 'px-2', 'md:px-6', 'py-2', 'md:py-3', 'text-red-600', 'font-medium', 'transition-colors', 'cursor-pointer', 'inline-flex', 'items-center', 'justify-center', 'gap-1', 'md:gap-2', 'whitespace-nowrap', 'border-2', 'border-red-600', 'rounded-lg', 'md:border-none', 'md:underline');
    
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
    
    // Should have button container with correct flex layout (updated classes)
    const buttonContainer = container.querySelector('.order-2.md\\:order-1.flex.flex-row.gap-2.md\\:gap-4');
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
    
    // Button container should use responsive flex direction (updated classes)
    const buttonContainer = container.querySelector('.order-2.md\\:order-1.flex.flex-row.gap-2.md\\:gap-4');
    expect(buttonContainer).toBeInTheDocument();
    
    // Should have proper responsive layout classes
    expect(buttonContainer).toHaveClass('flex', 'flex-row', 'gap-2', 'md:gap-4');
  });

  it('handles click events on buttons', () => {
    render(<HeroSection {...defaultProps} />);
    
    const downloadButton = screen.getByTestId('mock-download-button');
    const shareSpan = screen.getByText('Share Report');
    const shareButton = shareSpan.closest('button');
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