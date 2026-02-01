import ExecutiveSummarySection from '@/components/landing-page/ExecutiveSummarySection';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next-intl hooks used by the component
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    const translations = {
      'Home.landingPage.executiveSummary.title': 'Executive Summary',
      'Home.landingPage.executiveSummary.subtitle': 'Key Findings from the Report',
      'Home.landingPage.executiveSummary.description':
        'This comprehensive analysis presents the most critical findings from our research on global disaster response and humanitarian aid effectiveness.',
      'Home.landingPage.executiveSummary.buttonTexts.read': 'Read Full Report',
      'Home.landingPage.executiveSummary.buttonTexts.download': 'Download PDF',
      'Home.landingPage.executiveSummary.summaryAlt':
        'Executive Summary cover featuring a person in humanitarian context',
    };

    // Check if we're testing with custom content
    if (key === 'title' && mockExecutiveSummary?.customContent?.title) {
      return mockExecutiveSummary.customContent.title;
    }
    if (key === 'subtitle' && mockExecutiveSummary?.customContent?.subtitle) {
      return mockExecutiveSummary.customContent.subtitle;
    }
    if (key === 'description' && mockExecutiveSummary?.customContent?.description) {
      return mockExecutiveSummary.customContent.description;
    }
    if (key === 'buttonTexts.read' && mockExecutiveSummary?.customContent?.buttonTexts?.read) {
      return mockExecutiveSummary.customContent.buttonTexts.read;
    }
    if (
      key === 'buttonTexts.download' &&
      mockExecutiveSummary?.customContent?.buttonTexts?.download
    ) {
      return mockExecutiveSummary.customContent.buttonTexts.download;
    }

    return translations[`${namespace}.${key}`] || key;
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, className, ...props }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
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
    <a href={href} className={className} data-testid="mock-link" {...props}>
      {children}
    </a>
  ),
}));


// Sample test data matching the translation structure
const mockReportData = {
  landingPage: {
    executiveSummary: {
      title: 'Executive Summary Test Title',
      subtitle: 'Executive Summary Test Subtitle',
      description:
        'This is a test description for the executive summary section that provides detailed information about the content.',
      buttonTexts: {
        read: 'Read Summary',
        download: 'Download PDF',
      },
    },
  },
};

const defaultProps = {
  locale: 'en',
  messages: {
    title: 'Executive Summary',
    subtitle: 'Key Findings from the Report',
    description: 'This comprehensive analysis presents the most critical findings from our research on global disaster response and humanitarian aid effectiveness.',
    buttonTexts: {
      read: 'Read Full Report',
      download: 'Download PDF',
    },
    summaryAlt: 'Executive Summary cover featuring a person in humanitarian context',
  },
};

// Global variable to control custom content in tests
let mockExecutiveSummary = null;

describe('ExecutiveSummarySection', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
    mockExecutiveSummary = null;
  });

  it('renders ExecutiveSummarySection with all content', () => {
    const { container } = render(<ExecutiveSummarySection {...defaultProps} />);

    // Should show title
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();

    // Should show subtitle
    expect(screen.getByText('Key Findings from the Report')).toBeInTheDocument();

    // Should show description
    expect(
      screen.getByText(
        'This comprehensive analysis presents the most critical findings from our research on global disaster response and humanitarian aid effectiveness.'
      )
    ).toBeInTheDocument();

    // Should show both buttons
    expect(screen.getByText('Read Full Report')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();

    // Should show images (now there are two for responsive design)
    const images = screen.getAllByTestId('mock-image');
    expect(images.length).toBe(2); // One for mobile, one for desktop
    expect(images[0]).toHaveAttribute('src', '/wdr25/summary.png');
    expect(images[0]).toHaveAttribute(
      'alt',
      'Executive Summary cover featuring a person in humanitarian context'
    );

    expect(container).toMatchSnapshot();
  });

  it('renders with different locale', () => {
    const frenchProps = {
      ...defaultProps,
      locale: 'fr',
    };

    render(<ExecutiveSummarySection {...frenchProps} />);

    // Should still render content (locale is passed but doesn't affect rendering directly in this test)
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByText('Key Findings from the Report')).toBeInTheDocument();
  });

  it('renders with custom report data', () => {
    const customProps = {
      locale: 'fr',
      messages: {
        title: 'Custom Title for Testing',
        subtitle: 'Custom Subtitle with Different Content',
        description: 'Custom description that is much longer and contains different information about the executive summary.',
        buttonTexts: {
          read: 'Lire le Résumé',
          download: 'Télécharger PDF',
        },
        summaryAlt: 'Custom alt text for testing',
      },
    };

    render(<ExecutiveSummarySection {...customProps} />);

    // Should show custom content
    expect(screen.getByText('Custom Title for Testing')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle with Different Content')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Custom description that is much longer and contains different information about the executive summary.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Lire le Résumé')).toBeInTheDocument();
    expect(screen.getByText('Télécharger PDF')).toBeInTheDocument();
  });

  it('has correct button styling and behavior', () => {
    render(<ExecutiveSummarySection {...defaultProps} />);

    // Check read button styling (now a Link component)
    const readButton = screen.getByTestId('mock-link');
    expect(readButton).toHaveClass(
      'px-6',
      'py-3',
      'bg-red-600',
      'text-white',
      'rounded-lg',
      'font-medium',
      'hover:bg-red-700',
      'transition-colors',
      'inline-flex',
      'items-center',
      'gap-2',
      'whitespace-nowrap'
    );
    expect(readButton).toHaveAttribute('href', '/reports/wdr25/chapter-02');
    expect(readButton).toHaveTextContent('Read Full Report');

    // Check download button styling (now using anchor tag with download styling)
    const downloadLink = screen.getByText('Download PDF').closest('a');
    expect(downloadLink).toHaveClass(
      'border-2',
      'border-red-600',
      'text-red-600',
      'hover:bg-red-600',
      'hover:text-white',
      'rounded-lg',
      'font-medium',
      'transition-colors',
      'inline-flex',
      'items-center',
      'gap-2',
      'whitespace-nowrap'
    );
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(downloadLink).toHaveTextContent('Download PDF');

    // Buttons should be clickable (even though no onClick handlers are defined)
    fireEvent.click(readButton);
    fireEvent.click(downloadLink);

    // Should not crash when clicked
    expect(readButton).toBeInTheDocument();
    expect(downloadLink).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<ExecutiveSummarySection {...defaultProps} />);

    // Should have main section (layout structure has changed)
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Should have main container with flex layout
    const mainContainer = container.querySelector(
      '.flex.flex-col.space-y-8.lg\\:grid.lg\\:grid-cols-2.lg\\:gap-12.lg\\:items-center.lg\\:space-y-0'
    );
    expect(mainContainer).toBeInTheDocument();

    // Should have text content container
    const textContainer = container.querySelector(
      '.flex.flex-col.space-y-6.lg\\:space-y-0.lg\\:h-full'
    );
    expect(textContainer).toBeInTheDocument();

    // Should have image container with correct aspect ratio (there are now two)
    const imageContainers = container.querySelectorAll('.relative.aspect-\\[3\\/4\\]');
    expect(imageContainers.length).toBe(2); // One for mobile, one for desktop
    imageContainers.forEach((container) => {
      expect(container).toHaveClass('rounded-2xl', 'overflow-hidden', 'bg-gray-200');
    });
  });

  it('has correct image properties', () => {
    render(<ExecutiveSummarySection {...defaultProps} />);

    const images = screen.getAllByTestId('mock-image');

    // Should have correct image attributes (check first image)
    expect(images[0]).toHaveAttribute('src', '/wdr25/summary.png');
    expect(images[0]).toHaveAttribute(
      'alt',
      'Executive Summary cover featuring a person in humanitarian context'
    );
    expect(images[0]).toHaveAttribute('data-fill', 'true');
    expect(images[0]).toHaveClass('object-cover');
  });

  it('handles missing or malformed data gracefully', () => {
    const malformedProps = {
      locale: 'en',
      messages: {
        title: '',
        subtitle: '',
        description: '',
        buttonTexts: {
          read: '',
          download: '',
        },
        summaryAlt: '',
      },
    };

    // Should not crash with empty strings
    expect(() => {
      render(<ExecutiveSummarySection {...malformedProps} />);
    }).not.toThrow();

    // Image should still render (there are now two images)
    expect(screen.getAllByTestId('mock-image')[0]).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(<ExecutiveSummarySection {...defaultProps} />);

    // Should use proper heading hierarchy
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Executive Summary');

    const h3 = screen.getByRole('heading', { level: 3 });
    expect(h3).toHaveTextContent('Key Findings from the Report');

    // Should have two links (read and download)
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    
    // Read link
    const readLink = links.find(link => link.textContent.includes('Read Full Report'));
    expect(readLink).toBeInTheDocument();
    expect(readLink).toHaveAttribute('href', '/reports/wdr25/chapter-02');
    
    // Download link
    const downloadLink = links.find(link => link.textContent.includes('Download PDF'));
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('target', '_blank');
  });

  it('uses flexbox layout correctly for content positioning', () => {
    const { container } = render(<ExecutiveSummarySection {...defaultProps} />);

    // Text container should use flex layout (updated classes)
    const textContainer = container.querySelector(
      '.flex.flex-col.space-y-6.lg\\:space-y-0.lg\\:h-full'
    );
    expect(textContainer).toBeInTheDocument();

    // Content area should have flex-1 to take available space (updated classes)
    const contentArea = container.querySelector('.lg\\:flex-1.lg\\:space-y-6.space-y-6');
    expect(contentArea).toBeInTheDocument();

    // Button area should have margin top (updated classes)
    const buttonArea = container.querySelector('.flex.gap-4.lg\\:mt-8');
    expect(buttonArea).toBeInTheDocument();
  });
});
