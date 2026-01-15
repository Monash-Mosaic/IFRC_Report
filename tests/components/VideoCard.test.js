import VideoCard from '@/components/landing-page/VideoCard';
import { render, screen } from '@testing-library/react';

// Mock YouTubeEmbed component
jest.mock('@next/third-parties/google', () => ({
  YouTubeEmbed: ({ videoid, params }) => (
    <div data-testid="mock-youtube-embed" data-videoid={videoid} data-params={params}>
      YouTube Player: {videoid}
    </div>
  ),
}));

const defaultProps = {
  title: 'Test Video Title',
  description: 'This is a test video description that explains the content of the video.',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

describe('VideoCard', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders VideoCard with title and description', () => {
    const { container } = render(<VideoCard {...defaultProps} />);

    // Should show title
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();

    // Should show description
    expect(
      screen.getByText('This is a test video description that explains the content of the video.')
    ).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('renders a YouTube embed for YouTube URLs', () => {
    render(<VideoCard {...defaultProps} />);

    const youtubeEmbed = screen.getByTestId('mock-youtube-embed');
    expect(youtubeEmbed).toHaveAttribute('data-videoid', 'dQw4w9WgXcQ');
    expect(youtubeEmbed).toHaveAttribute('data-params', 'rel=0');
  });

  it('renders an HTML5 video for non-YouTube URLs', () => {
    const { container } = render(
      <VideoCard
        title="HTML5 Video Title"
        description="This is an HTML5 video for testing non-YouTube URLs."
        url="https://example.com/video.mp4"
      />
    );

    const video = container.querySelector('video');
    const source = container.querySelector('source');
    expect(video).toBeInTheDocument();
    expect(source).toHaveAttribute('src', 'https://example.com/video.mp4');
  });

  it('extracts YouTube IDs for multiple URL formats', () => {
    const youtubeUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/v/dQw4w9WgXcQ',
    ];

    for (const url of youtubeUrls) {
      const { unmount } = render(
        <VideoCard title="YouTube Video" description="Video" url={url} />
      );

      const youtubeEmbed = screen.getByTestId('mock-youtube-embed');
      expect(youtubeEmbed).toHaveAttribute('data-videoid', 'dQw4w9WgXcQ');

      unmount();
    }
  });

  it('uses expected structure and classes', () => {
    const { container } = render(<VideoCard {...defaultProps} />);

    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-2xl', 'overflow-hidden', 'shadow-sm', 'h-full');

    const content = container.querySelector('.p-6.space-y-3');
    expect(content).toBeInTheDocument();

    const title = screen.getByText('Test Video Title');
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');

    const description = screen.getByText(
      'This is a test video description that explains the content of the video.'
    );
    expect(description).toHaveClass('text-gray-600', 'text-sm', 'leading-relaxed');
  });
});
