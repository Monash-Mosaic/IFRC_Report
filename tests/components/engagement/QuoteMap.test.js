import { render, screen, fireEvent } from '@testing-library/react';
import QuoteMap from '@/components/engagement/QuoteMap';

const mockMapInstance = {
  on: jest.fn((event, layerOrHandler, maybeHandler) => {
    const handler = typeof layerOrHandler === 'function' ? layerOrHandler : maybeHandler;
    if (event === 'load' && handler) handler();
  }),
  addSource: jest.fn(),
  addLayer: jest.fn(),
  getSource: jest.fn(() => ({ setData: jest.fn() })),
  setFeatureState: jest.fn(),
  queryRenderedFeatures: jest.fn(() => []),
  remove: jest.fn(),
  setProjection: jest.fn(),
  addControl: jest.fn(),
  getCanvas: jest.fn(() => ({ style: { cursor: '' } })),
};

jest.mock(
  'mapbox-gl',
  () => ({
    __esModule: true,
    default: {
      accessToken: '',
      Map: jest.fn(() => mockMapInstance),
      NavigationControl: jest.fn(),
    },
  }),
  { virtual: true }
);

jest.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

jest.mock('lucide-react', () => ({
  Heart: ({ className }) => <span data-testid="heart-icon" className={className} />,
  QuoteIcon: () => <span data-testid="quote-icon" />,
}));

describe('QuoteMap', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'test-token';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('id,country\n1,UK\n2,CHINA'),
    });
    mockMapInstance.on.mockClear();
  });

  it('renders map panel and quote sidebar', async () => {
    render(<QuoteMap selectedTag={{}} handleSelectionTag={jest.fn()} />);

    expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    expect(screen.getAllByText('United Kingdom').length).toBeGreaterThan(0);
    expect(screen.getByTestId('quote-icon')).toBeInTheDocument();
  });

  it('calls handleSelectionTag when heart button is clicked', () => {
    const handleSelectionTag = jest.fn();
    render(<QuoteMap selectedTag={{}} handleSelectionTag={handleSelectionTag} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleSelectionTag).toHaveBeenCalledWith('regulation');
  });
});
