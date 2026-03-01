import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

jest.mock('@/components/LocaleSwitcher', () => {
  return function MockLocaleSwitcher() {
    return <div data-testid="locale-switcher">Locale Switcher</div>;
  };
});

jest.mock('@/components/SearchInput', () => {
  return function MockSearchInput() {
    return <div data-testid="search-input">Search Input</div>;
  };
});

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/current-path',
  getPathname: ({ locale, href }) => `/${locale}${href}`,
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(async (arg) => {
    const namespace = typeof arg === 'string' ? arg : arg?.namespace;
    return (key) => {
      const translations = {
        'Home.nav.about': 'About',
        'Home.nav.acknowledgement': 'Acknowledgement',
        'Home.nav.search': 'Search',
        'Home.nav.searchPlaceholder': 'Search',
      };
      return translations[`${namespace}.${key}`] || key;
    };
  }),
  useLocale: () => 'en',
}));

jest.mock('lucide-react', () => ({
  Menu: ({ className }) => <span className={className} data-testid="menu-icon" />,
  X: ({ className }) => <span className={className} data-testid="x-icon" />,
}));

const renderHeader = async (locale = 'en') => render(await Header({ locale }));

describe('Header', () => {
  it('renders logo, navigation links, and child components', async () => {
    await renderHeader();

    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Acknowledgement').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('locale-switcher')).toHaveLength(2);
    expect(screen.getAllByTestId('search-input')).toHaveLength(2);
  });

  it('uses a checkbox + label for the CSS-only mobile menu toggle', async () => {
    const { container } = await renderHeader();

    const toggleCheckbox = container.querySelector('#mobile-menu-toggle');
    const toggleControl = screen.getByLabelText('Toggle mobile menu');

    expect(toggleCheckbox).toBeInTheDocument();
    expect(toggleCheckbox).toHaveAttribute('type', 'checkbox');
    expect(toggleCheckbox).not.toBeChecked();

    fireEvent.click(toggleControl);
    expect(toggleCheckbox).toBeChecked();

    fireEvent.click(toggleControl);
    expect(toggleCheckbox).not.toBeChecked();
  });

  it('renders both menu icons and relies on CSS classes for visibility', async () => {
    const { container } = await renderHeader();

    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();

    const iconWrapper = container.querySelector(
      '.peer-checked\\:\\[\\&_\\.menu-open-icon\\]\\:hidden.peer-checked\\:\\[\\&_\\.menu-close-icon\\]\\:block'
    );
    expect(iconWrapper).toBeInTheDocument();
  });

  it('keeps mobile navigation mounted and controls visibility through CSS classes', async () => {
    const { container } = await renderHeader();
    const mobileMenu = container.querySelector(
      '.hidden.peer-checked\\:block.lg\\:hidden.bg-white.border-t.border-gray-200.shadow-lg'
    );

    expect(mobileMenu).toBeInTheDocument();
    expect(mobileMenu).toHaveClass('hidden', 'peer-checked:block', 'lg:hidden');
  });

  describe('Responsive Behavior', () => {
    it('search expands correctly on desktop', async () => {
      await renderHeader();

      expect(screen.getAllByText('About').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Acknowledgement').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('search-input')).toHaveLength(2);
    });

    it('mobile search works correctly', async () => {
      const { container } = await renderHeader();

      const toggleCheckbox = container.querySelector('#mobile-menu-toggle');
      const toggleControl = screen.getByLabelText('Toggle mobile menu');
      expect(toggleCheckbox).not.toBeChecked();

      fireEvent.click(toggleControl);
      expect(toggleCheckbox).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', async () => {
      await renderHeader();

      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument();
      expect(screen.getByAltText('Logo')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      await renderHeader();

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      links[0].focus();

      expect(document.activeElement).toBe(links[0]);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes for different states', async () => {
      const { container } = await renderHeader();

      const toggleControl = screen.getByLabelText('Toggle mobile menu');
      expect(toggleControl).toHaveClass(
        'p-2',
        'text-red-700',
        'hover:text-red-900',
        'transition-colors',
        'cursor-pointer'
      );

      const mobileMenu = container.querySelector(
        '.hidden.peer-checked\\:block.lg\\:hidden.bg-white.border-t.border-gray-200.shadow-lg'
      );
      expect(mobileMenu).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates with LocaleSwitcher component', async () => {
      await renderHeader();

      // Should render LocaleSwitcher components
      const localeSwitchers = screen.getAllByTestId('locale-switcher');
      expect(localeSwitchers.length).toBeGreaterThan(0);
    });
  });
});
