import { render, screen, waitFor } from '@testing-library/react';
import QuotesSection from '@/components/engagement/QuotesSection';

const engagementTranslations = {
  'Engagement.quotesTitle': 'Quotes',
  'Engagement.loadingQuotes': 'Loading quotes…',
  'Engagement.noQuotesMatch': 'No quotes match the selected filters.',
  'Engagement.errorLoadingQuotes': 'Could not load quotes. Please try again.',
  'Engagement.filtersActive': (params) => `${params?.count ?? 0} filter(s) active`,
};

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace) => (key, params) => {
    const fullKey = `${namespace}.${key}`;
    const value = engagementTranslations[fullKey];
    return typeof value === 'function' ? value(params) : value ?? key;
  },
}));

jest.mock('lucide-react', () => ({
  QuoteIcon: () => <span data-testid="quote-icon" />,
  Monitor: () => <span />,
  Wifi: () => <span />,
  Smartphone: () => <span />,
  Activity: () => <span />,
  User: () => <span />,
  Building2: () => <span />,
}));

jest.mock('@/components/EmblaCarousel', () => function MockEmblaCarousel({ children }) {
  return <div data-testid="embla-carousel">{children}</div>;
});

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
});

describe('QuotesSection', () => {
  it('shows loading message while fetching', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<QuotesSection selectedTag={{}} />);
    expect(screen.getByText('Loading quotes…')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<QuotesSection selectedTag={{}} />);
    await waitFor(() => {
      expect(screen.getByText('Could not load quotes. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows quotes when fetch succeeds with valid TSV', async () => {
    const tsv = [
      'Q_ID\tQuote text\tChapter\tcountry_region\ttag:harm\ttag:operational_impact\ttag:response_strategy\ttag:governance',
      '1\tTest quote one\tCH1\tCountry A\tSocial\t\t\t',
    ].join('\n');
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(tsv) });
    render(<QuotesSection selectedTag={{}} />);
    await waitFor(() => {
      expect(screen.getByText('Quotes')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Test quote one/)).toBeInTheDocument();
    });
  });

  it('shows no quotes match when filters exclude all results', async () => {
    const tsv = [
      'Q_ID\tQuote text\tChapter\tcountry_region\ttag:harm\ttag:operational_impact\ttag:response_strategy\ttag:governance',
      '1\tTest quote\tCH1\tCountry A\tSocial\t\t\t',
    ].join('\n');
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(tsv) });
    render(<QuotesSection selectedTag={{ physical: true }} />);
    await waitFor(() => {
      expect(screen.getByText('No quotes match the selected filters.')).toBeInTheDocument();
    });
  });

  it('displays quote count in section header after load', async () => {
    const tsv = [
      'Q_ID\tQuote text\tChapter\tcountry_region\ttag:harm\ttag:operational_impact\ttag:response_strategy\ttag:governance',
      '1\tQuote A\tCH1\t\tSocial\t\t\t',
      '2\tQuote B\tCH1\t\tPhysical\t\t\t',
    ].join('\n');
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(tsv) });
    render(<QuotesSection selectedTag={{}} />);
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
