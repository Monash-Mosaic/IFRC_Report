import HeroVideo from '@/components/landing-page/HeroVideo';
import { render, screen, waitFor } from '@testing-library/react';

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

const defaultProps = {
  heroAlt: 'World Disasters Report 2025 hero image',
};

describe('HeroVideo', () => {
  // Store original navigator
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
    // Reset navigator mock
    delete global.navigator;
    global.navigator = { ...originalNavigator };
  });

  afterEach(() => {
    global.navigator = originalNavigator;
  });

  it('renders video element with default 720p quality', () => {
    delete global.navigator.connection;

    const { container } = render(<HeroVideo {...defaultProps} />);

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveClass('w-full', 'h-full', 'object-cover', 'object-center');
    expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/720p.mp4');
  });

  it('shows poster image initially', () => {
    render(<HeroVideo {...defaultProps} />);

    // Poster image should be visible when video is not ready
    const images = screen.getAllByTestId('mock-image');
    expect(images.length).toBeGreaterThan(0);
    
    const posterImage = images.find(img => img.getAttribute('src') === '/wdr25/hero/poster.jpg');
    expect(posterImage).toBeInTheDocument();
    expect(posterImage).toHaveAttribute('alt', 'World Disasters Report 2025 hero image');
  });

  it('uses 240p MP4 when saveData is enabled', async () => {
    global.navigator.connection = {
      saveData: true,
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/240p.mp4');
    });
  });

  it('uses 240p MP4 when connection is 2g', async () => {
    global.navigator.connection = {
      effectiveType: '2g',
      saveData: false,
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/240p.mp4');
    });
  });

  it('uses 240p MP4 when connection is slow-2g', async () => {
    global.navigator.connection = {
      effectiveType: 'slow-2g',
      saveData: false,
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/240p.mp4');
    });
  });

  it('uses 480p MP4 when connection is 3g', async () => {
    global.navigator.connection = {
      effectiveType: '3g',
      saveData: false,
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/480p.mp4');
    });
  });

  it('uses 720p MP4 when 4g connection has low downlink', async () => {
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: false,
      downlink: 1.2, // Less than 1.5 Mbps
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/720p.mp4');
    });
  });

  it('uses 1080p MP4 when 4g connection has high downlink', async () => {
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: false,
      downlink: 2.5, // 1.5 Mbps or higher
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/1080p.mp4');
    });
  });

  it('uses 1080p MP4 when 4g connection has no downlink info', async () => {
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: false,
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/1080p.mp4');
    });
  });

  it('uses 720p MP4 by default when network info is unavailable', () => {
    delete global.navigator.connection;

    const { container } = render(<HeroVideo {...defaultProps} />);

    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/720p.mp4');
  });

  it('prioritizes saveData over effectiveType', async () => {
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: true,
      downlink: 5.0,
    };

    const { container } = render(<HeroVideo {...defaultProps} />);

    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('src', '/wdr25/hero/mp4/240p.mp4');
    });
  });

  it('renders video with correct attributes', () => {
    const { container } = render(<HeroVideo {...defaultProps} />);

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('autoplay'); // React converts autoPlay to autoplay
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveProperty('muted', true); // muted is a boolean property
    expect(video).toHaveAttribute('playsinline'); // React converts playsInline to playsinline
    expect(video).toHaveAttribute('preload', 'auto');
  });
});
