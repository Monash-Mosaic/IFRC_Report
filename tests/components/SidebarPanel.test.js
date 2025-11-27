import SidebarPanel from '@/components/SidebarPanel';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock YouTubeEmbed component from @next/third-parties
jest.mock('@next/third-parties/google', () => ({
  YouTubeEmbed: ({ videoid, height, params }) => (
    <div data-testid="youtube-embed" data-videoid={videoid} data-height={height} data-params={params}>
      YouTube Video: {videoid}
    </div>
  ),
}));

// Mock next-intl hooks used by the component
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key, params) => {
    const translations = {
      'SidebarPanel.expandSidebar': 'Expand sidebar',
      'SidebarPanel.closeSidebar': 'Close sidebar',
      'SidebarPanel.back': 'Back',
      'SidebarPanel.resources': 'Resources',
      'SidebarPanel.chapterResourcesPanel': 'Chapter Resources Panel',
      'SidebarPanel.panel.notes': 'Notes',
      'SidebarPanel.panel.audios': 'Audio',
      'SidebarPanel.panel.videos': 'Videos',
      'SidebarPanel.loading': 'Loading',
      'SidebarPanel.noMediaAvailable.audio': 'No audio available for this chapter',
      'SidebarPanel.noMediaAvailable.videos': 'No videos available for this chapter',
      'SidebarPanel.selectMediaToPlay.audio': 'Select an audio to play',
      'SidebarPanel.selectMediaToPlay.videos': 'Select a video to play',
      'SidebarPanel.playerForAccessibility.audio': 'Audio player for enhanced accessibility',
      'SidebarPanel.playerForAccessibility.videos': 'Video player for enhanced accessibility',
      'SidebarPanel.closeMediaPanel': 'Close media panel',
      'SidebarPanel.duration': 'Duration',
    };
    
    return translations[`${namespace}.${key}`] || key;
  },
}));

// Sample test data
const mockAudios = [
  {
    id: 'audio-1',
    name: 'Test Audio 1',
    duration: '02:30',
    url: 'https://example.com/audio1.mp3',
  },
  {
    id: 'audio-2', 
    name: 'Test Audio 2',
    duration: '03:45',
    url: 'https://example.com/audio2.mp3',
  },
];

const mockVideos = [
  {
    id: 'video-1',
    name: 'Test Video 1',
    duration: '05:20',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: '/test-thumbnail.jpg',
  },
  {
    id: 'video-2',
    name: 'Test Video 2', 
    duration: '04:15',
    url: 'https://example.com/video2.mp4',
    thumbnail: '/test-thumbnail2.jpg',
  },
];

const defaultProps = {
  chapterTitle: 'Test Chapter Title',
  audios: mockAudios,
  videos: mockVideos,
};

describe('SidebarPanel', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders SidebarPanel with collapsed state by default', () => {
    const { container } = render(<SidebarPanel {...defaultProps} />);
    
    // Should show the expand button when collapsed
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    
    // Should not show the sidebar content when collapsed
    expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    
    expect(container).toMatchSnapshot();
  });

  it('expands sidebar when expand button is clicked', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Click expand button
    const expandButton = screen.getByLabelText('Expand sidebar');
    fireEvent.click(expandButton);
    
    // Should show sidebar content
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Test Chapter Title')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
  });

  it('collapses sidebar when back button is clicked', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar first
    const expandButton = screen.getByLabelText('Expand sidebar');
    fireEvent.click(expandButton);
    
    // Click back button
    const backButton = screen.getByLabelText('Close sidebar');
    fireEvent.click(backButton);
    
    // Should hide sidebar content
    expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    // Should show expand button again
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
  });

  it('opens audio panel when audio menu item is clicked', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar
    const expandButton = screen.getByLabelText('Expand sidebar');
    fireEvent.click(expandButton);
    
    // Click audio menu item
    const audioButton = screen.getByText('Audio');
    fireEvent.click(audioButton);
    
    // Should show audio media panel with both audios listed (check by count)
    expect(screen.getAllByText('Test Audio 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Audio 2').length).toBeGreaterThan(0);
    expect(screen.getByText('02:30')).toBeInTheDocument();
    expect(screen.getByText('03:45')).toBeInTheDocument();
  });

  it('opens video panel when video menu item is clicked', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar
    const expandButton = screen.getByLabelText('Expand sidebar');
    fireEvent.click(expandButton);
    
    // Click video menu item
    const videoButton = screen.getByText('Videos');
    fireEvent.click(videoButton);
    
    // Should show video media panel with both videos listed
    expect(screen.getAllByText('Test Video 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Video 2').length).toBeGreaterThan(0);
    expect(screen.getByText('05:20')).toBeInTheDocument();
    expect(screen.getByText('04:15')).toBeInTheDocument();
  });

  it('plays audio when audio item is selected', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar and open audio panel
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    fireEvent.click(screen.getByText('Audio'));
    
    // Should show audio player (first item auto-loads)
    const audioElement = screen.getByTestId('audio-player');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('src', 'https://example.com/audio1.mp3');
    
    // Should show track info
    expect(screen.getByText('Duration: 02:30')).toBeInTheDocument();
  });

  it('plays YouTube video when YouTube video item is selected', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar and open video panel
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    fireEvent.click(screen.getByText('Videos'));
    
    // Click on the first video button (YouTube video) in the media list
    const videoButtons = screen.getAllByRole('button');
    const youtubeVideoButton = videoButtons.find(button => 
      button.textContent.includes('Test Video 1') && 
      button.textContent.includes('05:20') &&
      button.className.includes('w-full text-left')
    );
    fireEvent.click(youtubeVideoButton);
    
    // Should show YouTube embed
    const youtubeEmbed = screen.getByTestId('youtube-embed');
    expect(youtubeEmbed).toBeInTheDocument();
    expect(youtubeEmbed).toHaveAttribute('data-videoid', 'dQw4w9WgXcQ');
    expect(youtubeEmbed).toHaveAttribute('data-height', '300');
    
    // Should show track info in the player area (not in the list)
    expect(screen.getByText('Duration: 05:20')).toBeInTheDocument();
  });

  it('plays regular video when non-YouTube video item is selected', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar and open video panel
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    fireEvent.click(screen.getByText('Videos'));
    
    // Click on the second video button (regular video) in the media list
    const videoButtons = screen.getAllByRole('button');
    const regularVideoButton = videoButtons.find(button => 
      button.textContent.includes('Test Video 2') && 
      button.textContent.includes('04:15') &&
      button.className.includes('w-full text-left')
    );
    fireEvent.click(regularVideoButton);
    
    // Should show HTML video element
    const videoElement = screen.getByTestId('video-player');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('poster', '/test-thumbnail2.jpg');
    
    // Should show track info in the player area
    expect(screen.getByText('Duration: 04:15')).toBeInTheDocument();
  });

  it('closes media panel when close button is clicked', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar and open audio panel
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    fireEvent.click(screen.getByText('Audio'));
    
    // Click close button
    const closeButton = screen.getByLabelText('Close media panel');
    fireEvent.click(closeButton);
    
    // Should hide media panel
    expect(screen.queryByText('Test Audio 1')).not.toBeInTheDocument();
    // Should still show sidebar
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('handles empty audio and video arrays', () => {
    const emptyProps = {
      ...defaultProps,
      audios: [],
      videos: [],
    };
    
    render(<SidebarPanel {...emptyProps} />);
    
    // Expand sidebar and open audio panel
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    fireEvent.click(screen.getByText('Audio'));
    
    // Should show the empty state message parts (using enum-based translations)
    expect(screen.getByText('No audio available for this chapter')).toBeInTheDocument();
    expect(screen.getByText('Select an audio to play')).toBeInTheDocument();
  });

  it('shows notes panel when notes menu item is clicked', () => {
    render(<SidebarPanel {...defaultProps} />);
    
    // Expand sidebar
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    
    // Click notes menu item
    const notesButton = screen.getByText('Notes');
    fireEvent.click(notesButton);
    
    // Notes functionality is not fully implemented yet, 
    // but should not crash and should close any open media panels
    expect(screen.queryByTestId('youtube-embed')).not.toBeInTheDocument();
    expect(screen.queryByTestId('audio-player')).not.toBeInTheDocument();
  });

  it('renders with custom chapter title', () => {
    const customProps = {
      ...defaultProps,
      chapterTitle: 'Custom Chapter Title with Very Long Name That Should Be Displayed',
    };
    
    render(<SidebarPanel {...customProps} />);
    
    // Expand sidebar
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    
    // Should show custom chapter title
    expect(screen.getByText('Custom Chapter Title with Very Long Name That Should Be Displayed')).toBeInTheDocument();
  });
});
