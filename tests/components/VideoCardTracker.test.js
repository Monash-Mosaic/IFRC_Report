import { render, screen, fireEvent } from '@testing-library/react';
import VideoCardTracker from '@/components/landing-page/VideoCardTracker';

const trackVideoPlay = jest.fn();

jest.mock('@/lib/gtm', () => ({
  trackVideoPlay: (...args) => trackVideoPlay(...args),
}));

describe('VideoCardTracker', () => {
  beforeEach(() => {
    trackVideoPlay.mockClear();
  });

  it('renders children and tracks video play on first click only', () => {
    render(
      <VideoCardTracker title="Intro video" url="https://example.com/video.mp4">
        <button type="button">Play</button>
      </VideoCardTracker>
    );

    const playButton = screen.getByRole('button', { name: 'Play' });
    fireEvent.click(playButton);
    fireEvent.click(playButton);

    expect(trackVideoPlay).toHaveBeenCalledTimes(1);
    expect(trackVideoPlay).toHaveBeenCalledWith({
      title: 'Intro video',
      url: 'https://example.com/video.mp4',
    });
  });
});
