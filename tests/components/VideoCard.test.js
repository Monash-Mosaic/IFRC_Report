import VideoCard from '@/components/landing-page/VideoCard';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next-intl hooks used by the component
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    const translations = {
      'Home.videoCard.backToThumbnail': 'Back to thumbnail',
      'Home.videoCard.videoAriaLabel': 'Play video',
    };
    return translations[`${namespace}.${key}`] || key;
  },
}));

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

// Mock YouTubeEmbed component
jest.mock('@next/third-parties/google', () => ({
  YouTubeEmbed: ({ videoid, params }) => (
    <div data-testid="mock-youtube-embed" data-videoid={videoid} data-params={params}>
      YouTube Player: {videoid}
    </div>
  ),
}));

// Sample test data for video card
const mockVideoData = {
  title: 'Test Video Title',
  description: 'This is a test video description that explains the content of the video.',
  thumbnailSrc: '/test-thumbnail.jpg',
  thumbnailAlt: 'Test video thumbnail showing humanitarian work',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

const mockHtml5VideoData = {
  title: 'HTML5 Video Title',
  description: 'This is an HTML5 video for testing non-YouTube URLs.',
  thumbnailSrc: '/test-html5-thumbnail.jpg',
  thumbnailAlt: 'HTML5 video thumbnail',
  url: 'https://example.com/video.mp4',
};

const defaultProps = {
  title: mockVideoData.title,
  description: mockVideoData.description,
  thumbnailSrc: mockVideoData.thumbnailSrc,
  thumbnailAlt: mockVideoData.thumbnailAlt,
  url: mockVideoData.url,
};

describe('VideoCard', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders VideoCard with all content', () => {
    const { container } = render(<VideoCard {...defaultProps} />);

    // Should show title
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();

    // Should show description
    expect(
      screen.getByText('This is a test video description that explains the content of the video.')
    ).toBeInTheDocument();

    // Should show thumbnail image
    const thumbnail = screen.getByTestId('mock-image');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute('src', '/test-thumbnail.jpg');
    expect(thumbnail).toHaveAttribute('alt', 'Test video thumbnail showing humanitarian work');

    // Should show play button
    const playButton = screen.getByLabelText('Play video');
    expect(playButton).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('renders with different video data', () => {
    const customProps = {
      title: 'Custom Video Title for Testing',
      description: 'Custom description with different content for testing purposes.',
      thumbnailSrc: '/custom-thumbnail.jpg',
      thumbnailAlt: 'Custom video thumbnail alt text',
      url: 'https://www.youtube.com/watch?v=custom123',
    };

    render(<VideoCard {...customProps} />);

    // Should show custom content
    expect(screen.getByText('Custom Video Title for Testing')).toBeInTheDocument();
    expect(
      screen.getByText('Custom description with different content for testing purposes.')
    ).toBeInTheDocument();

    const thumbnail = screen.getByTestId('mock-image');
    expect(thumbnail).toHaveAttribute('src', '/custom-thumbnail.jpg');
    expect(thumbnail).toHaveAttribute('alt', 'Custom video thumbnail alt text');
  });

  it('plays YouTube video when play button is clicked', async () => {
    render(<VideoCard {...defaultProps} />);

    const playButton = screen.getByLabelText('Play video');

    // Click play button
    fireEvent.click(playButton);

    // Should show YouTube embed
    await waitFor(() => {
      expect(screen.getByTestId('mock-youtube-embed')).toBeInTheDocument();
    });

    const youtubeEmbed = screen.getByTestId('mock-youtube-embed');
    expect(youtubeEmbed).toHaveAttribute('data-videoid', 'dQw4w9WgXcQ');
    expect(youtubeEmbed).toHaveAttribute('data-params', 'autoplay=1&rel=0');

    // Should show back to thumbnail button
    expect(screen.getByText('Back to thumbnail')).toBeInTheDocument();
  });

  it('plays HTML video when play button is clicked for non-YouTube URL', async () => {
    const { container } = render(<VideoCard {...mockHtml5VideoData} />);

    const playButton = screen.getByLabelText('Play video');

    // Click play button
    fireEvent.click(playButton);

    // Should show HTML video element
    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('autoplay');
      expect(video).toHaveAttribute('controls');
    });
  });

  it('returns to thumbnail when "Back to thumbnail" button is clicked', async () => {
    render(<VideoCard {...defaultProps} />);

    const playButton = screen.getByLabelText('Play video');

    // Click play button to show video
    fireEvent.click(playButton);

    // Wait for video to appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-youtube-embed')).toBeInTheDocument();
    });

    // Click back to thumbnail button
    const backButton = screen.getByText('Back to thumbnail');
    fireEvent.click(backButton);

    // Should show thumbnail again
    await waitFor(() => {
      expect(screen.getByTestId('mock-image')).toBeInTheDocument();
      expect(screen.getByLabelText('Play video')).toBeInTheDocument();
    });

    // Should not show video anymore
    expect(screen.queryByTestId('mock-youtube-embed')).not.toBeInTheDocument();
  });

  it('has correct card styling and behavior', () => {
    const { container } = render(<VideoCard {...defaultProps} />);

    // Check main card styling
    const card = container.querySelector(
      '.bg-white.rounded-2xl.overflow-hidden.shadow-sm.hover\\:shadow-md.transition-shadow.h-full'
    );
    expect(card).toBeInTheDocument();

    // Check thumbnail container
    const thumbnailContainer = container.querySelector('.relative.aspect-video.bg-gray-200');
    expect(thumbnailContainer).toBeInTheDocument();

    // Check content area
    const contentArea = container.querySelector('.p-6.space-y-3');
    expect(contentArea).toBeInTheDocument();

    // Check title styling
    const title = screen.getByText('Test Video Title');
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-gray-900');

    // Check description styling
    const description = screen.getByText(
      'This is a test video description that explains the content of the video.'
    );
    expect(description.tagName).toBe('P');
    expect(description).toHaveClass('text-gray-500', 'text-lg', 'leading-relaxed');
  });

  it('has correct layout structure', () => {
    const { container } = render(<VideoCard {...defaultProps} />);

    // Should have main card with correct classes
    const card = container.firstChild;
    expect(card).toHaveClass(
      'bg-white',
      'rounded-2xl',
      'overflow-hidden',
      'shadow-sm',
      'hover:shadow-md',
      'transition-shadow',
      'h-full'
    );

    // Should have thumbnail section with aspect ratio
    const thumbnailSection = container.querySelector('.relative.aspect-video.bg-gray-200');
    expect(thumbnailSection).toBeInTheDocument();

    // Should have play button overlay
    const playOverlay = container.querySelector(
      '.absolute.inset-0.flex.items-center.justify-center'
    );
    expect(playOverlay).toBeInTheDocument();

    // Should have content section with padding
    const contentSection = container.querySelector('.p-6.space-y-3');
    expect(contentSection).toBeInTheDocument();
  });

  it('handles empty or missing data gracefully', () => {
    const emptyProps = {
      title: '',
      description: '',
      thumbnailSrc: '/placeholder.jpg', // Use placeholder instead of empty string
      thumbnailAlt: '',
      url: '',
    };

    // Should not crash with empty strings
    expect(() => {
      render(<VideoCard {...emptyProps} />);
    }).not.toThrow();

    // Should still render the card structure
    const { container } = render(<VideoCard {...emptyProps} />);
    expect(container.querySelector('.bg-white.rounded-2xl')).toBeInTheDocument();
  });

  it('extracts YouTube ID correctly from different URL formats', async () => {
    const youtubeUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/v/dQw4w9WgXcQ',
    ];

    for (const url of youtubeUrls) {
      const { unmount } = render(<VideoCard {...defaultProps} url={url} />);

      const playButton = screen.getByLabelText('Play video');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByTestId('mock-youtube-embed')).toBeInTheDocument();
      });

      const youtubeEmbed = screen.getByTestId('mock-youtube-embed');
      expect(youtubeEmbed).toHaveAttribute('data-videoid', 'dQw4w9WgXcQ');

      // Clean up for next iteration
      unmount();
    }
  });

  it('has proper semantic HTML structure', () => {
    render(<VideoCard {...defaultProps} />);

    // Should use proper heading hierarchy
    const h3 = screen.getByRole('heading', { level: 3 });
    expect(h3).toHaveTextContent('Test Video Title');

    // Should have play button with proper aria-label
    const playButton = screen.getByRole('button', { name: 'Play video' });
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
  });

  it('handles video ended event for HTML video', async () => {
    const { container } = render(<VideoCard {...mockHtml5VideoData} />);

    const playButton = screen.getByLabelText('Play video');
    fireEvent.click(playButton);

    // Wait for HTML video to appear
    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();

      // Simulate video ended event
      fireEvent.ended(video);
    });

    // Should return to thumbnail automatically
    await waitFor(() => {
      expect(screen.getByTestId('mock-image')).toBeInTheDocument();
      expect(screen.getByLabelText('Play video')).toBeInTheDocument();
    });
  });

  it('maintains state independence between multiple video cards', () => {
    const { container } = render(
      <div>
        <VideoCard {...defaultProps} />
        <VideoCard {...mockHtml5VideoData} />
      </div>
    );

    const playButtons = screen.getAllByLabelText('Play video');
    expect(playButtons).toHaveLength(2);

    // Click first play button
    fireEvent.click(playButtons[0]);

    // Only first video should be playing
    expect(screen.getByTestId('mock-youtube-embed')).toBeInTheDocument();

    // Second video should still show thumbnail
    const thumbnails = screen.getAllByTestId('mock-image');
    expect(thumbnails).toHaveLength(1); // Only the second video's thumbnail should remain
  });

  it('has correct play button styling', () => {
    const { container } = render(<VideoCard {...defaultProps} />);

    const playButton = screen.getByLabelText('Play video');
    expect(playButton).toHaveClass(
      'w-12',
      'h-12',
      'bg-white/90',
      'rounded-full',
      'flex',
      'items-center',
      'justify-center',
      'hover:bg-white',
      'transition-colors',
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500'
    );

    // Should have SVG icon
    const svg = playButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-6', 'h-6', 'text-gray-800', 'ml-1');
  });
});
