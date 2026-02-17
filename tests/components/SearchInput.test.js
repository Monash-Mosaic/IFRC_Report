import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchInput from '@/components/SearchInput';

let mockLocale = 'en';
let mockPathname = '/';
let mockQuery = null;

jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: (namespace) => (key) => {
    const translations = {
      'Home.nav.search': 'Search',
      'Home.nav.searchPlaceholder': 'Search within WDR 2026...',
    };
    return translations[`${namespace}.${key}`] || key;
  },
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key) => (key === 'q' ? mockQuery : null),
  }),
}));

jest.mock('@/i18n/navigation', () => ({
  getPathname: ({ locale, href }) => `/${locale}${href}`,
  usePathname: () => mockPathname,
}));

jest.mock('@/i18n/helper', () => ({
  isRtlLocale: (locale) => locale === 'ar',
}));

jest.mock('next/form', () => ({
  __esModule: true,
  default: ({ children, ...props }) => <form {...props}>{children}</form>,
}));

jest.mock('lucide-react', () => ({
  Search: ({ className }) => <span className={className} data-testid="icon-search" />,
  X: ({ className }) => <span className={className} data-testid="icon-x" />,
  ArrowRight: ({ className }) => <span className={className} data-testid="icon-arrow-right" />,
}));

const getOverlayForm = () => screen.queryByRole('search');
const getOverlayInput = () => document.querySelector('input[name="q"]');

describe('SearchInput', () => {
  beforeEach(() => {
    mockLocale = 'en';
    mockPathname = '/';
    mockQuery = null;
  });

  it('renders trigger input with localized placeholder and hidden overlay by default', () => {
    render(<SearchInput />);

    const triggerInput = screen.getByRole('searchbox', { name: 'Search' });
    expect(triggerInput).toHaveAttribute('placeholder', 'Search within WDR 2026...');
    expect(getOverlayForm()).not.toBeInTheDocument();
  });

  it('opens overlay when trigger input receives focus', async () => {
    render(<SearchInput />);

    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search' }));

    await waitFor(() => {
      expect(getOverlayForm()).toBeInTheDocument();
    });
  });

  it('opens overlay when search icon button is clicked', async () => {
    render(<SearchInput />);

    const searchButtons = screen.getAllByRole('button', { name: 'Search' });
    fireEvent.click(searchButtons[0]);

    await waitFor(() => {
      expect(getOverlayForm()).toBeInTheDocument();
    });
  });

  it('initializes query and opens overlay when URL contains q', () => {
    mockQuery = 'trust';
    render(<SearchInput />);

    expect(getOverlayForm()).toBeInTheDocument();
    expect(getOverlayInput()).toHaveValue('trust');
    const searchInputs = screen.getAllByRole('searchbox', { name: 'Search' });
    expect(searchInputs[0]).toHaveValue('trust');
  });

  it('uses localized search action path in overlay form', () => {
    mockQuery = 'trust';
    mockLocale = 'es';
    render(<SearchInput />);

    expect(screen.getByRole('search')).toHaveAttribute('action', '/es/search');
  });

  it('clears query and keeps focus on overlay input when clear button is clicked', async () => {
    mockQuery = 'trust';
    render(<SearchInput />);

    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(getOverlayInput()).toHaveValue('');
      expect(document.activeElement).toBe(getOverlayInput());
    });
  });

  it('prevents submit and focuses input when query is empty', async () => {
    render(<SearchInput />);
    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search' }));

    const form = await screen.findByRole('search');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    await act(async () => {
      form.dispatchEvent(submitEvent);
    });

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(getOverlayForm()).toBeInTheDocument();
    expect(document.activeElement).toBe(getOverlayInput());
  });

  it('submits without preventing default and closes overlay when query is not empty', async () => {
    render(<SearchInput />);
    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search' }));

    const input = await waitFor(() => getOverlayInput());
    fireEvent.change(input, { target: { value: 'climate' } });

    const form = screen.getByRole('search');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    await act(async () => {
      form.dispatchEvent(submitEvent);
    });

    expect(submitEvent.defaultPrevented).toBe(false);
    await waitFor(() => {
      expect(getOverlayForm()).not.toBeInTheDocument();
    });
  });

  it('closes overlay on outside blur and Escape when not on /search page', async () => {
    render(<SearchInput />);
    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search' }));

    const form = await screen.findByRole('search');
    const blurContainer = form.parentElement;
    await act(async () => {
      fireEvent.blur(blurContainer, { relatedTarget: document.body });
    });

    await waitFor(() => {
      expect(getOverlayForm()).not.toBeInTheDocument();
    });

    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search' }));
    await screen.findByRole('search');
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    await waitFor(() => {
      expect(getOverlayForm()).not.toBeInTheDocument();
    });
  });

  it('keeps overlay open on /search page and applies RTL mirroring class to close arrow', () => {
    mockPathname = '/search';
    mockLocale = 'ar';
    render(<SearchInput />);

    expect(getOverlayForm()).toBeInTheDocument();
    const closeArrow = screen.getByTestId('icon-arrow-right');
    expect(closeArrow).toBeInTheDocument();
    expect(closeArrow).toHaveClass('rtl:-scale-x-100');

    const form = screen.getByRole('search');
    const blurContainer = form.parentElement;
    fireEvent.blur(blurContainer, { relatedTarget: document.body });
    expect(getOverlayForm()).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    const searchButtons = screen.getAllByRole('button', { name: 'Search' });
    act(() => {
      fireEvent.click(searchButtons[searchButtons.length - 1]);
    });

    expect(getOverlayForm()).toBeInTheDocument();
  });
});
