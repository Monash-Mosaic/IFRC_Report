import HeroSection from '@/components/landing-page/HeroSection';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next-intl hooks used by the component
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    const translations = {
      'Home.landingPage.heroSection.title': 'World Disasters Report 2025 Test Title',
      'Home.landingPage.heroSection.description':
        'This is a comprehensive test description for the hero section that provides detailed information about the World Disasters Report and its importance in humanitarian work.',
      'Home.landingPage.heroSection.buttonTexts.read': 'Read Report',
      'Home.landingPage.heroSection.buttonTexts.download': 'Download PDF',
      'Home.landingPage.heroSection.buttonTexts.share': 'Share Report',
      'Home.landingPage.heroSection.heroAlt':
        'World Disasters Report 2025 hero image',
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

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return jest.fn(() => {
    return function MockReactPlayer({ src, url, playing, loop, muted, playsinline, playsInline, onReady, onPlaying, ...props }) {
      // Use src (v3) or url (fallback) for ReactPlayer
      const playlistUrl = src || url;
      // Call onReady/onPlaying after a short delay to simulate player loading
      if (onReady || onPlaying) {
        setTimeout(() => {
          if (onReady) onReady();
          if (onPlaying) onPlaying();
        }, 0);
      }
      return (
        <div
          data-testid="mock-react-player"
          data-url={playlistUrl}
          data-src={playlistUrl}
          data-playing={playing}
          data-loop={loop}
          data-muted={muted}
          data-playsinline={playsinline || playsInline}
          {...props}
        />
      );
    };
  });
});

// Mock next-intl navigation Link component
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, className, children, ...props }) => (
    <a href={href} className={className} data-testid="mock-link" {...props}>
      {children}
    </a>
  ),
}));

const defaultProps = {
  locale: 'en',
  messages: {
    title: 'World Disasters Report 2025',
    description: 'Explore the most comprehensive analysis of global disasters and humanitarian responses in 2025.',
    buttonTexts: {
      read: 'Read Report',
      download: 'Download PDF',
      share: 'Share Report',
    },
    heroAlt: 'World Disasters Report 2025 hero image',
  },
};

// Global variable to control custom content in tests
let mockHeroSection = null;

describe('HeroSection', () => {
  // Store original navigator
  const originalNavigator = global.navigator;

  beforeEach(() => {
    mockHeroSection = null;
    // Reset any mocks before each test
    jest.clearAllMocks();
    // Reset navigator mock
    delete global.navigator;
    global.navigator = { ...originalNavigator };
  });

  afterEach(() => {
    global.navigator = originalNavigator;
  });

  it('renders HeroSection with all content', () => {
    const { container } = render(<HeroSection {...defaultProps} />);

    // Should show description
    expect(
      screen.getByText(
        'Explore the most comprehensive analysis of global disasters and humanitarian responses in 2025.'
      )
    ).toBeInTheDocument();

    // Should show all three buttons/links
    expect(screen.getByText('Read Report')).toBeInTheDocument();
    expect(screen.getAllByText('Download PDF')).toHaveLength(1); // One instance
    expect(screen.getByText('Share Report')).toBeInTheDocument();

    // Should show poster image
    const image = screen.getByTestId('mock-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/wdr25/hero/poster.jpg');
    expect(image).toHaveAttribute(
      'alt',
      'World Disasters Report 2025 hero image'
    );
    expect(image).toHaveAttribute('data-priority', 'true');

    // Should show ReactPlayer with master playlist by default (when Network API unavailable)
    const player = screen.getByTestId('mock-react-player');
    expect(player).toBeInTheDocument();
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/master.m3u8');
    expect(player).toHaveAttribute('data-playing', 'true');
    expect(player).toHaveAttribute('data-loop', 'true');
    expect(player).toHaveAttribute('data-muted', 'true');

    expect(container).toMatchSnapshot();
  });

  it('renders with different locale', () => {
    const frenchProps = {
      ...defaultProps,
      locale: 'fr',
    };

    render(<HeroSection {...frenchProps} />);

    // Should still render content (locale is passed but doesn't affect rendering directly)
    expect(
      screen.getByText(
        'Explore the most comprehensive analysis of global disasters and humanitarian responses in 2025.'
      )
    ).toBeInTheDocument();
  });

  it('renders with custom report data', () => {
    const customProps = {
      locale: 'fr',
      messages: {
        title: 'Custom Hero Title for Testing Purposes',
        description: 'Custom hero description with different content and longer text to test the component rendering capabilities.',
        buttonTexts: {
          read: 'Lire le Rapport',
          download: 'Télécharger PDF',
          share: 'Partager Rapport',
        },
        heroAlt: 'Custom hero alt text for testing',
      },
    };

    render(<HeroSection {...customProps} />);

    expect(
      screen.getByText(
        'Custom hero description with different content and longer text to test the component rendering capabilities.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Lire le Rapport')).toBeInTheDocument();
    expect(screen.getAllByText('Télécharger PDF')).toHaveLength(1); // Only one instance now
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
    expect(readLink).toHaveClass(
      'flex-1',
      'md:flex-none',
      'px-3',
      'md:px-6',
      'py-2',
      'md:py-3',
      'bg-red-600',
      'text-white',
      'rounded-lg',
      'font-medium',
      'hover:bg-red-700',
      'transition-colors',
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-1',
      'md:gap-2',
      'whitespace-nowrap'
    );
  });

  it('has correct button styling and behavior', () => {
    render(<HeroSection {...defaultProps} />);

    // Check download button styling (now using anchor tag)
    const downloadLink = screen.getByText('Download PDF').closest('a');
    expect(downloadLink).toHaveClass(
      'w-full',
      'h-full',
      'px-3',
      'md:px-6',
      'py-2',
      'md:py-3',
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
      'justify-center'
    );
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveTextContent('Download PDF');

    // Check share button styling
    const shareSpan = screen.getByText('Share Report');
    const shareButton = shareSpan.closest('button');
    expect(shareButton).toHaveClass(
      'w-12',
      'md:w-auto',
      'px-2',
      'md:px-6',
      'py-2',
      'md:py-3',
      'text-red-600',
      'font-medium',
      'transition-colors',
      'cursor-pointer',
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-1',
      'md:gap-2',
      'whitespace-nowrap',
      'border-2',
      'border-red-600',
      'rounded-lg',
      'md:border-none',
      'md:underline'
    );

    // Buttons should be clickable (even though no onClick handlers are defined)
    fireEvent.click(downloadLink);
    fireEvent.click(shareButton);

    // Should not crash when clicked
    expect(downloadLink).toBeInTheDocument();
    expect(shareButton).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<HeroSection {...defaultProps} />);

    // Should have main section with space-y-8
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-8');

    // Should have text content container
    const textContainer = container.querySelector('.space-y-6');
    expect(textContainer).toBeInTheDocument();

    // Should have button container with correct flex layout (updated classes)
    const buttonContainer = container.querySelector(
      '.order-2.md\\:order-1.flex.flex-row.gap-2.md\\:gap-4'
    );
    expect(buttonContainer).toBeInTheDocument();

    // Should have video container with correct styling
    const videoContainer = container.querySelector('.relative.pt-8.pb-8');
    expect(videoContainer).toBeInTheDocument();
    expect(videoContainer).toHaveClass('overflow-hidden', 'rounded-lg');
  });

  it('has correct image properties', () => {
    render(<HeroSection {...defaultProps} />);

    const image = screen.getByTestId('mock-image');

    // Should have correct image attributes (poster image)
    expect(image).toHaveAttribute('src', '/wdr25/hero/poster.jpg');
    expect(image).toHaveAttribute(
      'alt',
      'World Disasters Report 2025 hero image'
    );
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveAttribute('data-priority', 'true');
    expect(image).toHaveClass('object-cover');
  });

  it('uses save_data playlist when saveData is enabled', () => {
    // Mock navigator.connection with saveData enabled
    global.navigator.connection = {
      saveData: true,
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/save_data.m3u8');
  });

  it('uses 2g playlist when connection is 2g', () => {
    // Mock navigator.connection with 2g connection
    global.navigator.connection = {
      effectiveType: '2g',
      saveData: false,
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/2g.m3u8');
  });

  it('uses 2g playlist when connection is slow-2g', () => {
    // Mock navigator.connection with slow-2g connection
    global.navigator.connection = {
      effectiveType: 'slow-2g',
      saveData: false,
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/2g.m3u8');
  });

  it('uses 3g playlist when connection is 3g', () => {
    // Mock navigator.connection with 3g connection
    global.navigator.connection = {
      effectiveType: '3g',
      saveData: false,
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/3g.m3u8');
  });

  it('uses low4g playlist when 4g connection has low downlink', () => {
    // Mock navigator.connection with 4g but low bandwidth
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: false,
      downlink: 1.2, // Less than 1.5 Mbps
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/low4g.m3u8');
  });

  it('uses 4g playlist when 4g connection has high downlink', () => {
    // Mock navigator.connection with 4g and good bandwidth
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: false,
      downlink: 2.5, // 1.5 Mbps or higher
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/4g.m3u8');
  });

  it('uses 4g playlist when 4g connection has no downlink info', () => {
    // Mock navigator.connection with 4g but no downlink
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: false,
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/4g.m3u8');
  });

  it('uses master playlist by default when network info is unavailable', () => {
    // No connection object
    delete global.navigator.connection;

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/master.m3u8');
  });

  it('prioritizes saveData over effectiveType', () => {
    // Mock navigator.connection with saveData enabled and 4g
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: true,
      downlink: 5.0,
    };

    render(<HeroSection {...defaultProps} />);

    const player = screen.getByTestId('mock-react-player');
    // Should use save_data playlist even though connection is 4g
    expect(player).toHaveAttribute('data-url', '/wdr25/hero/hls/save_data.m3u8');
  });

  it('handles missing or malformed data gracefully', () => {
    const malformedProps = {
      locale: 'en',
      messages: {
        title: '',
        description: '',
        buttonTexts: {
          read: '',
          download: '',
          share: '',
        },
        heroAlt: '',
      },
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
    expect(h1).toHaveTextContent('World Disasters Report 2025');
    expect(h1).toHaveClass(
      'text-5xl',
      'md:text-7xl/18',
      'font-bold',
      'text-white',
      'leading-tight',
      'text-end'
    );

    // Should have buttons with proper role (only Share button, Download is now a link)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1); // Only Share button (Download is now a link, Read is a Link)
    expect(buttons[0]).toHaveTextContent('Share Report');

    // Should have links with proper role (Read and Download)
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2); // Read and Download links
    const readLink = links.find(link => link.textContent.includes('Read Report'));
    const downloadLink = links.find(link => link.textContent.includes('Download PDF'));
    expect(readLink).toBeInTheDocument();
    expect(downloadLink).toBeInTheDocument();
  });

  it('has responsive text sizing', () => {
    render(<HeroSection {...defaultProps} />);

    // Title should have responsive classes
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-5xl', 'md:text-7xl/18');

    // Description should have responsive classes
    const description = screen.getByText(/Explore the most comprehensive analysis/);
    expect(description).toHaveClass(
      'text-4xl',
      'text-white',
      'max-w-90',
      'text-balance',
      'md:text-balance',
      'leading-tight',
      'font-bold'
    );
  });

  it('has responsive button layout', () => {
    const { container } = render(<HeroSection {...defaultProps} />);

    // Button container should use responsive flex direction (updated classes)
    const buttonContainer = container.querySelector(
      '.order-2.md\\:order-1.flex.flex-row.gap-2.md\\:gap-4'
    );
    expect(buttonContainer).toBeInTheDocument();

    // Should have proper responsive layout classes
    expect(buttonContainer).toHaveClass('flex', 'flex-row', 'gap-2', 'md:gap-4');
  });

  it('handles click events on buttons', () => {
    render(<HeroSection {...defaultProps} />);

    const downloadLink = screen.getByText('Download PDF').closest('a');
    const shareSpan = screen.getByText('Share Report');
    const shareButton = shareSpan.closest('button');
    const readLink = screen.getByText('Read Report');

    // Should be able to click all interactive elements without errors
    expect(() => {
      fireEvent.click(downloadLink);
      fireEvent.click(shareButton);
      fireEvent.click(readLink);
    }).not.toThrow();

    // Elements should still be in document after clicking
    expect(downloadLink).toBeInTheDocument();
    expect(shareButton).toBeInTheDocument();
    expect(readLink).toBeInTheDocument();
  });
});
