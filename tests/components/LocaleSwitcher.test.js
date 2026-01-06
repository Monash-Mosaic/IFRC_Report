import LocaleSwitcher from '@/components/LocaleSwitcher';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Globe: ({ className, ...props }) => (
    <div className={className} data-testid="globe-icon" {...props}>
      Globe Icon
    </div>
  ),
  ChevronDown: ({ className, ...props }) => (
    <div className={className} data-testid="chevron-down-icon" {...props}>
      ChevronDown Icon
    </div>
  ),
}));

// Mock navigation helper used by the component
const replaceMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  usePathname: () => '/',
}));

// Mock next-intl hooks used by the component
let currentLocale = 'en';
jest.mock('next-intl', () => ({
  useLocale: () => currentLocale,
  useTranslations: (namespace) => (key) => {
    const translations = {
      'LocaleSwitcher.ariaLabel': 'Select language',
      'LocaleSwitcher.title': 'Select language',
      'LocaleSwitcher.language': 'Language',
    };
    return translations[`${namespace}.${key}`] || key;
  },
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replaceMock.mockClear();
    refreshMock.mockClear();
    currentLocale = 'en';
  });

  it('renders LocaleSwitcher with button and icons', () => {
    render(<LocaleSwitcher />);

    // Check that the main button is rendered
    expect(screen.getByRole('button', { name: 'Select language' })).toBeInTheDocument();

    // Check that icons are present
    expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();

    // Check that dropdown is initially closed
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<LocaleSwitcher />);

    const button = screen.getByRole('button', { name: 'Select language' });
    fireEvent.click(button);

    // Dropdown should be open with language options
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Chinese')).toBeInTheDocument();
    expect(screen.getByText('Russian')).toBeInTheDocument();
    expect(screen.getByText('Arabic')).toBeInTheDocument();
  });

  it('switches locale when option is selected', () => {
    render(<LocaleSwitcher />);

    const button = screen.getByRole('button', { name: 'Select language' });
    fireEvent.click(button);

    // Click on French option
    const frenchOption = screen.getByText('Français');
    fireEvent.click(frenchOption);

    // Should call router.replace with new locale
    expect(replaceMock).toHaveBeenCalledWith('/', { locale: 'fr' });
    expect(refreshMock).toHaveBeenCalled();
  });

  it('does not switch to the same locale', () => {
    currentLocale = 'fr';
    render(<LocaleSwitcher />);

    const button = screen.getByRole('button', { name: 'Select language' });
    fireEvent.click(button);

    // Click on the current locale (French)
    const frenchOption = screen.getByText('Français');
    fireEvent.click(frenchOption);

    // Should not call router functions when selecting the same locale
    expect(replaceMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('closes dropdown when an option is selected', () => {
    render(<LocaleSwitcher />);

    const button = screen.getByRole('button', { name: 'Select language' });
    fireEvent.click(button);

    // Dropdown should be open
    expect(screen.getByText('Français')).toBeInTheDocument();

    // Select a different option (not the current locale)
    const frenchOption = screen.getByText('Français');
    fireEvent.click(frenchOption);

    // Dropdown should be closed
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });

  it('disables current locale option', () => {
    currentLocale = 'en';
    render(<LocaleSwitcher />);

    const button = screen.getByRole('button', { name: 'Select language' });
    fireEvent.click(button);

    // Current locale option should be disabled
    const englishOption = screen.getByText('English');
    expect(englishOption).toBeDisabled();
  });

  it('renders correctly and matches snapshot', () => {
    const { container } = render(<LocaleSwitcher />);
    expect(container).toMatchSnapshot();
  });
});
