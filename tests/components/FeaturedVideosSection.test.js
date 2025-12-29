import FeaturedVideosSection from '@/components/landing-page/FeaturedVideosSection';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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

// Mock YouTubeEmbed component from @next/third-parties
jest.mock('@next/third-parties/google', () => ({
  YouTubeEmbed: ({ videoid, params }) => (
    <div data-testid="youtube-embed" data-videoid={videoid} data-params={params}>
      YouTube Video: {videoid}
    </div>
  ),
}));

// Sample test data matching the translation structure
const mockReportData = {
  landingPage: {
    featuredVideos: {
      title: 'Featured Videos from Around the World',
      videos: [
        {
          id: 1,
          title: 'Test Video 1',
          description: 'This is the first test video description with detailed information.',
          thumbnailSrc: '/test-thumbnail1.jpg',
          thumbnailAlt: 'Test video 1 thumbnail',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
          id: 2,
          title: 'Test Video 2',
          description: 'This is the second test video description with more content.',
          thumbnailSrc: '/test-thumbnail2.jpg',
          thumbnailAlt: 'Test video 2 thumbnail',
          url: 'https://example.com/video.mp4'
        },
        {
          id: 3,
          title: 'Test Video 3',
          description: 'This is the third test video for grid layout testing.',
          thumbnailSrc: '/test-thumbnail3.jpg',
          thumbnailAlt: 'Test video 3 thumbnail',
          url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM'
        }
      ]
    }
  }
};

const defaultProps = {
  reportData: mockReportData,
  locale: 'en'
};

describe('FeaturedVideosSection', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders FeaturedVideosSection with all content', () => {
    const { container } = render(<FeaturedVideosSection {...defaultProps} />);
    
    // Should show section title
    expect(screen.getByText('Featured Videos from Around the World')).toBeInTheDocument();
    
    // Should show all video titles
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    expect(screen.getByText('Test Video 2')).toBeInTheDocument();
    expect(screen.getByText('Test Video 3')).toBeInTheDocument();
    
    // Should show all video descriptions
    expect(screen.getByText('This is the first test video description with detailed information.')).toBeInTheDocument();
    expect(screen.getByText('This is the second test video description with more content.')).toBeInTheDocument();
    expect(screen.getByText('This is the third test video for grid layout testing.')).toBeInTheDocument();
    
    // Should show all thumbnails
    const images = screen.getAllByTestId('mock-image');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', '/test-thumbnail1.jpg');
    expect(images[1]).toHaveAttribute('src', '/test-thumbnail2.jpg');
    expect(images[2]).toHaveAttribute('src', '/test-thumbnail3.jpg');
    
    // Should show play buttons
    const playButtons = screen.getAllByLabelText('Play video');
    expect(playButtons).toHaveLength(3);
    
    expect(container).toMatchSnapshot();
  });

  it('renders with different locale', () => {
    const frenchProps = {
      ...defaultProps,
      locale: 'fr'
    };
    
    render(<FeaturedVideosSection {...frenchProps} />);
    
    // Should still render content (locale is passed but doesn't affect rendering directly)
    expect(screen.getByText('Featured Videos from Around the World')).toBeInTheDocument();
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
  });

  it('renders with custom report data', () => {
    const customReportData = {
      landingPage: {
        featuredVideos: {
          title: 'Vidéos Personnalisées',
          videos: [
            {
              id: 1,
              title: 'Vidéo Test Française',
              description: 'Description personnalisée en français.',
              thumbnailSrc: '/french-thumbnail.jpg',
              thumbnailAlt: 'Miniature vidéo française',
              url: 'https://www.youtube.com/watch?v=custom123'
            }
          ]
        }
      }
    };

    const customProps = {
      reportData: customReportData,
      locale: 'fr'
    };
    
    render(<FeaturedVideosSection {...customProps} />);
    
    // Should show custom content
    expect(screen.getByText('Vidéos Personnalisées')).toBeInTheDocument();
    expect(screen.getByText('Vidéo Test Française')).toBeInTheDocument();
    expect(screen.getByText('Description personnalisée en français.')).toBeInTheDocument();
  });

  it('plays YouTube video when play button is clicked', async () => {
    render(<FeaturedVideosSection {...defaultProps} />);
    
    // Click the first video's play button (YouTube video)
    const playButtons = screen.getAllByLabelText('Play video');
    fireEvent.click(playButtons[0]);
    
    // Should show YouTube embed
    await waitFor(() => {
      const youtubeEmbed = screen.getByTestId('youtube-embed');
      expect(youtubeEmbed).toBeInTheDocument();
      expect(youtubeEmbed).toHaveAttribute('data-videoid', 'dQw4w9WgXcQ');
      expect(youtubeEmbed).toHaveAttribute('data-params', 'autoplay=1&rel=0');
    });
    
    // Should show "Back to thumbnail" button
    expect(screen.getByText('Back to thumbnail')).toBeInTheDocument();
    
    // Should have 2 remaining play buttons (for the other 2 videos)
    expect(screen.getAllByLabelText('Play video')).toHaveLength(2);
  });

  it('plays HTML video when play button is clicked for non-YouTube URL', async () => {
    render(<FeaturedVideosSection {...defaultProps} />);
    
    // Click the second video's play button (non-YouTube video)
    const playButtons = screen.getAllByLabelText('Play video');
    fireEvent.click(playButtons[1]);
    
    // Should show HTML video element
    await waitFor(() => {
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveAttribute('controls');
      expect(videoElement).toHaveAttribute('autoplay');
    });
    
    // Should show video source
    const videoElement = document.querySelector('video');
    const source = videoElement.querySelector('source');
    expect(source).toHaveAttribute('src', 'https://example.com/video.mp4');
    expect(source).toHaveAttribute('type', 'video/mp4');
    
    // Should show "Back to thumbnail" button
    expect(screen.getByText('Back to thumbnail')).toBeInTheDocument();
  });

  it('returns to thumbnail when "Back to thumbnail" button is clicked', async () => {
    render(<FeaturedVideosSection {...defaultProps} />);
    
    // Click play button to show video player
    const playButtons = screen.getAllByLabelText('Play video');
    fireEvent.click(playButtons[0]);
    
    // Wait for video player to appear
    await waitFor(() => {
      expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
    });
    
    // Click "Back to thumbnail" button
    const backButton = screen.getByText('Back to thumbnail');
    fireEvent.click(backButton);
    
    // Should show thumbnail again
    await waitFor(() => {
      expect(screen.getAllByLabelText('Play video')[0]).toBeInTheDocument();
      expect(screen.queryByTestId('youtube-embed')).not.toBeInTheDocument();
      expect(screen.queryByText('Back to thumbnail')).not.toBeInTheDocument();
    });
  });

  it('has correct grid layout structure', () => {
    const { container } = render(<FeaturedVideosSection {...defaultProps} />);
    
    // Should have main section with space-y-8
    const section = container.querySelector('section');
    expect(section).toHaveClass('space-y-8');
    
    // Should have grid container with responsive columns
    const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
    expect(gridContainer).toBeInTheDocument();
    
    // Should have correct number of video cards
    const videoCards = container.querySelectorAll('.bg-white.rounded-2xl');
    expect(videoCards).toHaveLength(3);
  });

  it('has correct video card styling', () => {
    const { container } = render(<FeaturedVideosSection {...defaultProps} />);
    
    // Check video card container styling
    const videoCards = container.querySelectorAll('.bg-white.rounded-2xl.overflow-hidden.shadow-sm');
    expect(videoCards[0]).toHaveClass('hover:shadow-md', 'transition-shadow');
    
    // Check thumbnail container
    const thumbnailContainer = container.querySelector('.relative.aspect-video.bg-gray-200');
    expect(thumbnailContainer).toBeInTheDocument();
    
    // Check play button styling
    const playButton = screen.getAllByLabelText('Play video')[0];
    expect(playButton).toHaveClass('w-12', 'h-12', 'bg-white/90', 'rounded-full', 'hover:bg-white', 'transition-colors');
  });

  it('handles empty videos array gracefully', () => {
    const emptyData = {
      landingPage: {
        featuredVideos: {
          title: 'No Videos Available',
          videos: []
        }
      }
    };

    const emptyProps = {
      reportData: emptyData,
      locale: 'en'
    };
    
    render(<FeaturedVideosSection {...emptyProps} />);
    
    // Should show title
    expect(screen.getByText('No Videos Available')).toBeInTheDocument();
    
    // Should not crash and should show empty grid
    expect(screen.queryByText('Test Video 1')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Play video')).not.toBeInTheDocument();
  });

  it('handles YouTube ID extraction correctly', () => {
    render(<FeaturedVideosSection {...defaultProps} />);
    
    // Click YouTube video
    const playButtons = screen.getAllByLabelText('Play video');
    fireEvent.click(playButtons[0]); // YouTube URL
    
    // Should extract correct video ID
    const youtubeEmbed = screen.getByTestId('youtube-embed');
    expect(youtubeEmbed).toHaveAttribute('data-videoid', 'dQw4w9WgXcQ');
  });

  it('has proper semantic HTML structure', () => {
    render(<FeaturedVideosSection {...defaultProps} />);
    
    // Should use proper heading hierarchy
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Featured Videos from Around the World');
    expect(h2).toHaveClass('text-3xl', 'md:text-4xl', 'font-bold', 'text-gray-900');
    
    // Should have headings for video titles
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements).toHaveLength(3);
    expect(h3Elements[0]).toHaveTextContent('Test Video 1');
    
    // Should have buttons with proper attributes
    const playButtons = screen.getAllByLabelText('Play video');
    expect(playButtons[0]).toHaveAttribute('aria-label', 'Play video');
    expect(playButtons[0]).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
  });

  it('handles video ended event for HTML video', async () => {
    render(<FeaturedVideosSection {...defaultProps} />);
    
    // Click non-YouTube video
    const playButtons = screen.getAllByLabelText('Play video');
    fireEvent.click(playButtons[1]);
    
    // Wait for video to appear
    await waitFor(() => {
      expect(document.querySelector('video')).toBeInTheDocument();
    });
    
    // Simulate video ended event
    const video = document.querySelector('video');
    fireEvent.ended(video);
    
    // Should return to thumbnail view
    await waitFor(() => {
      expect(screen.getAllByLabelText('Play video')).toHaveLength(3);
      expect(document.querySelector('video')).not.toBeInTheDocument();
    });
  });

  it('maintains state independence between video cards', async () => {
    render(<FeaturedVideosSection {...defaultProps} />);
    
    const playButtons = screen.getAllByLabelText('Play video');
    
    // Click first video (YouTube)
    fireEvent.click(playButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
    });
    
    // Other videos should still show play buttons (2 remaining)
    expect(screen.getAllByLabelText('Play video')).toHaveLength(2);
    
    // Click second video (HTML video)
    const remainingPlayButtons = screen.getAllByLabelText('Play video');
    fireEvent.click(remainingPlayButtons[0]); // This is now the second video since first is playing
    
    // Both videos should be playing independently
    await waitFor(() => {
      expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
      expect(document.querySelector('video')).toBeInTheDocument();
    });
    
    // Should have 2 "Back to thumbnail" buttons (one for each playing video)
    expect(screen.getAllByText('Back to thumbnail')).toHaveLength(2);
    
    // Only one play button should remain (for the third video)
    expect(screen.getAllByLabelText('Play video')).toHaveLength(1);
  });
});