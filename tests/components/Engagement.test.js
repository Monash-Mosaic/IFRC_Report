import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import TagContainer from '@/components/engagement/TagContainer';
import QuotesSection from '@/components/engagement/QuotesSection';
import QuoteMap from '@/components/engagement/QuoteMap';

/* ---------------- FETCH MOCK ---------------- */

global.fetch = jest.fn((url) => {
  if (url.includes('engagement_tab.csv')) {
    return Promise.resolve({
      text: () =>
        Promise.resolve(
          `Q_ID,Quote text,Chapter,country_region,tag:harm,tag:operational_impact,tag:response_strategy,tag:governance
1,"Test quote text",CH1,United Kingdom,Social,,Prebunking,`
        ),
    });
  }

  if (url.includes('countries.csv')) {
    return Promise.resolve({
      ok: true,
      text: () =>
        Promise.resolve(
          `id,country
1,United Kingdom`
        ),
    });
  }

  return Promise.resolve({ text: () => Promise.resolve('') });
});

/* ---------------- MAPBOX MOCK ---------------- */

jest.mock('mapbox-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    setProjection: jest.fn(),
    addControl: jest.fn(),
    remove: jest.fn(),
    getSource: jest.fn(() => ({ setData: jest.fn() })),
    queryRenderedFeatures: jest.fn(() => []),
    getCanvas: jest.fn(() => ({ style: {} })),
  })),
  NavigationControl: jest.fn(),
}));

/* ---------------- LUCIDE MOCK ---------------- */

jest.mock('lucide-react', () => ({
  Funnel: () => <div />,
  Heart: () => <div />,
  QuoteIcon: () => <div />,
  Monitor: () => <div />,
  Wifi: () => <div />,
  Smartphone: () => <div />,
  Activity: () => <div />,
  User: () => <div />,
  Building2: () => <div />,
}));

/* ---------------- TAG CONTAINER TESTS ---------------- */

describe('TagContainer', () => {
  const handler = jest.fn();

  it('renders Browse Topics heading', () => {
    render(<TagContainer selectedTag={{}} handleSelectionTag={handler} />);
    expect(screen.getByText(/Browse Topics/i)).toBeInTheDocument();
  });

  it('calls handler when tag clicked', () => {
    render(<TagContainer selectedTag={{}} handleSelectionTag={handler} />);
    fireEvent.click(screen.getByText(/Psychological/i));
    expect(handler).toHaveBeenCalled();
  });
});

/* ---------------- QUOTES SECTION TESTS ---------------- */

describe('QuotesSection', () => {
  it('shows loading state initially', () => {
    render(<QuotesSection selectedTag={{}} />);
    expect(screen.getByText(/Loading quotes/i)).toBeInTheDocument();
  });

  it('renders fetched quote', async () => {
    render(<QuotesSection selectedTag={{}} />);
    expect(await screen.findByText(/Test quote text/i)).toBeInTheDocument();
  });
});

/* ---------------- QUOTE MAP TESTS ---------------- */

describe('QuoteMap', () => {
  const handler = jest.fn();

  it('renders selected label', () => {
    render(<QuoteMap selectedTag={{}} handleSelectionTag={handler} />);
    expect(screen.getByText(/Selected:/i)).toBeInTheDocument();
  });
});