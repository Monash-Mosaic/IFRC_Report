import { render, screen, waitFor } from '@testing-library/react';
import HeroVideo from '@/components/landing-page/HeroVideo';

const mockIsSupported = jest.fn();
const mockLoadSource = jest.fn();
const mockAttachMedia = jest.fn();

class HlsMock {
  constructor() {
    this.loadSource = mockLoadSource;
    this.attachMedia = mockAttachMedia;
    this.destroy = jest.fn();
  }

  static isSupported() {
    return mockIsSupported();
  }
}

jest.mock('hls.js/dist/hls.light.js', () => ({
  __esModule: true,
  default: HlsMock,
}));

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

describe('HeroVideo', () => {
  const originalNavigator = global.navigator;
  const originalCanPlayType = HTMLMediaElement.prototype.canPlayType;

  beforeEach(() => {
    jest.clearAllMocks();
    delete global.navigator;
    global.navigator = { ...originalNavigator };
    HTMLMediaElement.prototype.canPlayType = jest.fn(() => '');
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
  });

  it('renders poster image and video element', () => {
    const { container } = render(<HeroVideo alt="Hero alt text" />);

    expect(screen.getByAltText('Hero alt text')).toBeInTheDocument();
    expect(container.querySelector('video')).toBeInTheDocument();
  });

  it('uses native HLS when supported', async () => {
    HTMLMediaElement.prototype.canPlayType = jest.fn(() => 'probably');
    global.navigator.connection = { saveData: true };

    const { container } = render(<HeroVideo alt="Hero alt text" />);
    const video = container.querySelector('video');

    await waitFor(() => {
      expect(video.src).toContain('/wdr25/hero/hls/save_data.m3u8');
    });

    expect(mockIsSupported).not.toHaveBeenCalled();
  });

  it('uses hls.js when native HLS is unsupported', async () => {
    HTMLMediaElement.prototype.canPlayType = jest.fn(() => '');
    mockIsSupported.mockReturnValue(true);
    global.navigator.connection = { effectiveType: '3g', saveData: false };

    const { container } = render(<HeroVideo alt="Hero alt text" />);
    const video = container.querySelector('video');

    await waitFor(() => {
      expect(mockLoadSource).toHaveBeenCalledWith('/wdr25/hero/hls/3g.m3u8');
      expect(mockAttachMedia).toHaveBeenCalledWith(video);
    });
  });

  it('falls back to setting video src when hls.js is unsupported', async () => {
    HTMLMediaElement.prototype.canPlayType = jest.fn(() => '');
    mockIsSupported.mockReturnValue(false);
    global.navigator.connection = { effectiveType: '4g', saveData: false, downlink: 2.0 };

    const { container } = render(<HeroVideo alt="Hero alt text" />);
    const video = container.querySelector('video');

    await waitFor(() => {
      expect(video.src).toContain('/wdr25/hero/hls/4g.m3u8');
    });
  });
});
