import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommunityResearchInsight from '../CommunityResearchInsight';
import QuoteMap from '../QuoteMap';
import QuotesSection from '../QuotesSection';
import SurveyInsight from '../SurveyInsight';
import TagContainer, { TAG_CATEGORIES } from '../TagContainer';

// --------------------
// Mock lucide-react
// --------------------
jest.mock('lucide-react', () => ({
  QuoteIcon: (props) => <div data-testid="quote-icon" {...props} />,
  Heart: (props) => <div data-testid="heart-icon" {...props} />,
  Funnel: (props) => <div data-testid="funnel-icon" {...props} />,
  Monitor: () => <div data-testid="monitor-icon" />,
  Wifi: () => <div data-testid="wifi-icon" />,
  Smartphone: () => <div data-testid="smartphone-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  User: () => <div data-testid="user-icon" />,
  Building2: () => <div data-testid="building-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
}));

// --------------------
// Mock mapbox-gl
// --------------------
jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: {
    Map: function () {
      return {
        on: jest.fn(),
        addSource: jest.fn(),
        addLayer: jest.fn(),
        setProjection: jest.fn(),
        addControl: jest.fn(),
        getSource: jest.fn(() => ({ setData: jest.fn() })),
        queryRenderedFeatures: jest.fn(() => []),
        getCanvas: jest.fn(() => ({ style: {} })),
        remove: jest.fn(),
        setFeatureState: jest.fn(),
      };
    },
    NavigationControl: function () {},
    accessToken: '',
  },
}));

// --------------------
// Mock fetch
// --------------------
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () =>
      Promise.resolve(
        `Q_ID,Quote text,Chapter,country_region,tag:harm,tag:operational_impact,tag:response_strategy,tag:governance
        1,"Test quote text",CH1,United Kingdom,Social,,,
        `
      ),
  })
);

describe('CommunityResearchInsight', () => {
  it('renders quote content correctly', () => {
    render(<CommunityResearchInsight />);
    expect(screen.getByText(/Community Researchers insights/i)).toBeInTheDocument();
    expect(screen.getByText(/Misinformation often results/i)).toBeInTheDocument();
  });
});

describe('TagContainer', () => {
  const mockHandler = jest.fn();

  it('renders all category labels', () => {
    render(<TagContainer selectedTag={{}} handleSelectionTag={mockHandler} />);
    TAG_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category.label)).toBeInTheDocument();
    });
  });

  it('calls handleSelectionTag when tag clicked', () => {
    render(<TagContainer selectedTag={{}} handleSelectionTag={mockHandler} />);
    const firstTag = screen.getByRole('button', { name: /Psychological/i });
    fireEvent.click(firstTag);
    expect(mockHandler).toHaveBeenCalled();
  });

  it('shows selected count badge', () => {
    render(
      <TagContainer
        selectedTag={{ psychological: true }}
        handleSelectionTag={mockHandler}
      />
    );
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
  });
});

describe('SurveyInsight', () => {
  const mockHandler = jest.fn();

  it('renders survey stats', () => {
    render(<SurveyInsight selectedTag={{}} handleSelectionTag={mockHandler} />);
    expect(screen.getByText(/73.3%/)).toBeInTheDocument();
    expect(screen.getByText(/Survey Insights/i)).toBeInTheDocument();
  });

  it('calls handler when heart clicked', () => {
    render(<SurveyInsight selectedTag={{}} handleSelectionTag={mockHandler} />);
    const heartButtons = screen.getAllByTestId('heart-icon');
    fireEvent.click(heartButtons[0]);
    expect(mockHandler).toHaveBeenCalled();
  });
});

describe('QuotesSection', () => {
  it('renders loading state initially', () => {
    render(<QuotesSection selectedTag={{}} />);
    expect(screen.getByText(/Loading quotes/i)).toBeInTheDocument();
  });

  it('renders fetched quote', async () => {
    render(<QuotesSection selectedTag={{}} />);
    await waitFor(() =>
      expect(screen.getByText(/Test quote text/i)).toBeInTheDocument()
    );
  });
});

describe('QuoteMap', () => {
  const mockHandler = jest.fn();

  it('renders selected country label', () => {
    render(
      <QuoteMap
        selectedTag={{ regulation: false }}
        handleSelectionTag={mockHandler}
      />
    );
    expect(screen.getByText(/Selected:/i)).toBeInTheDocument();
  });

  it('calls handler when heart button clicked', () => {
    render(
      <QuoteMap
        selectedTag={{ regulation: false }}
        handleSelectionTag={mockHandler}
      />
    );
    const heart = screen.getByTestId('heart-icon');
    fireEvent.click(heart);
    expect(mockHandler).toHaveBeenCalledWith('regulation');
  });
});