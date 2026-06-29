import { render, screen, waitFor } from '@testing-library/react';
import QuotesSection from '@/components/engagement/QuotesSection';

const discoverTranslations = {
  'Discover.quotesTitle': 'Quotes',
  'Discover.loadingQuotes': 'Loading quotes…',
  'Discover.noQuotesMatch': 'No quotes match the selected filters.',
  'Discover.errorLoadingQuotes': 'Could not load quotes. Please try again.',
  'Discover.filtersActive': (params) => `${params?.count ?? 0} filter(s) active`,
};

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace) => (key, params) => {
    const fullKey = `${namespace}.${key}`;
    const value = discoverTranslations[fullKey];
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
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
}));

jest.mock('next/image', () => function MockImage(props) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} />;
});

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, className, children, ...props }) => (
    <a
      href={typeof href === 'object' ? href.pathname : href}
      className={className}
      data-href-report={href?.params?.report}
      data-href-chapter={href?.params?.chapter}
      {...props}
    >
      {children}
    </a>
  ),
}));

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

  it('shows three tiles per page and paginates when more than three quotes', async () => {
    const tsv = [
      'Q_ID\tQuote text\tChapter\tcountry_region\ttag:harm\ttag:operational_impact\ttag:response_strategy\ttag:governance',
      '1\tQuote one\tCH1\t\tSocial\t\t\t',
      '2\tQuote two\tCH2\t\tSocial\t\t\t',
      '3\tQuote three\tCH3\t\tSocial\t\t\t',
      '4\tQuote four\tCH4\t\tSocial\t\t\t',
    ].join('\n');
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(tsv) });
    render(<QuotesSection selectedTag={{}} />);
    await waitFor(() => {
      expect(screen.getByText(/Quote one/)).toBeInTheDocument();
      expect(screen.getByText(/Quote three/)).toBeInTheDocument();
      expect(screen.queryByText(/Quote four/)).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
  });

it('renders Open link to the quote chapter', async () => {
  const tsv = [
    'Q_ID\tQuote text\tChapter\tcountry_region\ttag:harm\ttag:operational_impact\ttag:response_strategy\ttag:governance\turl',
    '1\tTest quote one\tCH1\t\tSocial\t\t\t\t/en/reports/wdr26/chapter-01#test',
  ].join('\n');

  mockFetch.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(tsv),
  });

  render(<QuotesSection selectedTag={{}} />);

  await waitFor(() => {
    const link = screen.getByRole('link', { name: /Open Chapter 1/i });
    expect(link).toHaveTextContent('Open');
    expect(link).toHaveAttribute(
      'href',
      '/en/reports/wdr26/chapter-01#test'
    );
  });
});
});
