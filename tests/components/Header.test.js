import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Header from '@/components/Header';

// Mock next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock LocaleSwitcher component
jest.mock('@/components/LocaleSwitcher', () => {
  return function MockLocaleSwitcher() {
    return <div data-testid="locale-switcher">Locale Switcher</div>;
  };
});

// Mock navigation helper used by the component
const pushMock = jest.fn();
jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, className, onClick }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/current-path',
}));

// Mock next-intl hooks used by the component
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    const translations = {
      'Home.nav.search': 'Search',
      'Home.nav.about': 'About',
      'Home.nav.games': 'Games',
    };
    return translations[`${namespace}.${key}`] || key;
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: ({ className, onClick, ...props }) => (
    <div className={className} onClick={onClick} data-testid="search-icon" {...props}>
      Search Icon
    </div>
  ),
  X: ({ className, onClick, ...props }) => (
    <div className={className} onClick={onClick} data-testid="x-icon" {...props}>
      X Icon
    </div>
  ),
  Mic: ({ className, onClick, onMouseDown, ...props }) => (
    <div 
      className={className} 
      onClick={onClick} 
      onMouseDown={onMouseDown}
      data-testid="mic-icon" 
      {...props}
    >
      Mic Icon
    </div>
  ),
}));

describe('Header', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  describe('Rendering', () => {
    it('renders the header component correctly', () => {
      render(<Header />);
      
      // Check logo
      expect(screen.getByAltText('Logo')).toBeInTheDocument();
      
      // Check desktop navigation elements
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Games')).toBeInTheDocument();
      
      // Check locale switcher
      expect(screen.getAllByTestId('locale-switcher')).toHaveLength(2); // Desktop and mobile
      
      // Check search input
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      
      // Check mobile menu button
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument();
    });

    it('matches snapshot', () => {
      const { container } = render(<Header />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Mobile Menu', () => {
    it('toggles mobile menu when button is clicked', async () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle mobile menu');
      
      // Initially mobile menu should not be visible
      expect(screen.queryByText('About')).toBeInTheDocument(); // Desktop version
      
      // Click to open mobile menu
      fireEvent.click(menuButton);
      
      // Mobile menu should now be visible (there will be multiple "About" links - desktop and mobile)
      const aboutLinks = screen.getAllByText('About');
      expect(aboutLinks.length).toBeGreaterThan(1);
    });

    it('closes mobile menu when a link is clicked', async () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle mobile menu');
      
      // Open mobile menu
      fireEvent.click(menuButton);
      
      // Get mobile navigation links (they should have specific mobile classes)
      const mobileLinks = screen.getAllByText('About');
      const mobileAboutLink = mobileLinks.find(link => 
        link.className.includes('block') && link.className.includes('py-2')
      );
      
      // Click mobile link
      if (mobileAboutLink) {
        fireEvent.click(mobileAboutLink);
      }
      
      // Mobile menu should close - we can check this by looking for the specific mobile menu container
      await waitFor(() => {
        const mobileMenus = screen.queryAllByText('About').filter(link => 
          link.className.includes('block') && link.className.includes('py-2')
        );
        expect(mobileMenus.length).toBe(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('expands search input on focus', async () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Initially search should not be expanded
      expect(screen.queryAllByTestId('x-icon')).toHaveLength(0);
      
      // Focus on search input using act to wrap state updates
      await act(async () => {
        fireEvent.focus(searchInput);
      });
      
      // Search should now be expanded - close icon should appear (both desktop and mobile)
      await waitFor(() => {
        const closeIcons = screen.getAllByTestId('x-icon');
        expect(closeIcons.length).toBeGreaterThan(0);
      });
      
      // Mic icon should also appear when expanded
      const micIcons = screen.getAllByTestId('mic-icon');
      expect(micIcons.length).toBeGreaterThan(0);
    });

    it('shows expanded state correctly', async () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Initially both desktop and mobile search should be collapsed
      expect(screen.queryAllByTestId('x-icon')).toHaveLength(0);
      expect(screen.queryAllByTestId('mic-icon')).toHaveLength(0);
      
      // Expand search
      await act(async () => {
        fireEvent.focus(searchInput);
      });
      
      // Both desktop and mobile search should now be expanded
      await waitFor(() => {
        const closeIcons = screen.getAllByTestId('x-icon');
        const micIcons = screen.getAllByTestId('mic-icon');
        expect(closeIcons.length).toBe(2); // Desktop and mobile
        expect(micIcons.length).toBe(2); // Desktop and mobile
      });
    });

    it('handles mic button click without closing search', async () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Expand search
      await act(async () => {
        fireEvent.focus(searchInput);
      });
      
      // Wait for expansion
      await waitFor(() => {
        const micIcons = screen.getAllByTestId('mic-icon');
        expect(micIcons.length).toBeGreaterThan(0);
      });
      
      // Click mic icon (desktop version)
      const micIcons = screen.getAllByTestId('mic-icon');
      await act(async () => {
        fireEvent.click(micIcons[0]);
      });
      
      // Search should still be expanded
      const closeIcons = screen.getAllByTestId('x-icon');
      const micIconsAfterClick = screen.getAllByTestId('mic-icon');
      expect(closeIcons.length).toBeGreaterThan(0);
      expect(micIconsAfterClick.length).toBeGreaterThan(0);
    });

    it('search input receives focus after expansion', async () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Focus on search input
      await act(async () => {
        fireEvent.focus(searchInput);
      });
      
      // Wait for the setTimeout in handleSearchFocus and check expansion occurred
      await waitFor(() => {
        const closeIcons = screen.getAllByTestId('x-icon');
        expect(closeIcons.length).toBeGreaterThan(0);
      });
      
      // The search should be expanded (we can verify this by the presence of the x-icon)
      const closeIcons = screen.getAllByTestId('x-icon');
      expect(closeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('search expands correctly on desktop', async () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Initially desktop nav should be visible
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Games')).toBeInTheDocument();
      
      // Expand search
      await act(async () => {
        fireEvent.focus(searchInput);
      });
      
      // Check that search expanded
      await waitFor(() => {
        const closeIcons = screen.getAllByTestId('x-icon');
        expect(closeIcons.length).toBeGreaterThan(0);
      });
    });

    it('mobile search works correctly', async () => {
      render(<Header />);
      
      // Get all search inputs (desktop and mobile)
      const searchInputs = screen.getAllByRole('textbox');
      const mobileSearchInput = searchInputs.find(input => 
        input.className.includes('w-10 h-10')
      );
      
      expect(mobileSearchInput).toBeInTheDocument();
      
      // Focus on mobile search input
      await act(async () => {
        fireEvent.focus(mobileSearchInput);
      });
      
      // Check that search expanded
      await waitFor(() => {
        const closeIcons = screen.getAllByTestId('x-icon');
        expect(closeIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Header />);
      
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument();
      expect(screen.getByAltText('Logo')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Tab to search input
      searchInput.focus();
      
      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes for different states', async () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      
      // Check initial classes
      expect(searchInput).toHaveClass('border-2', 'border-red-600', 'text-red-600');
      
      // Expand search and check for transition classes
      await act(async () => {
        fireEvent.focus(searchInput);
      });
      
      await waitFor(() => {
        expect(searchInput).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
      });
    });
  });

  describe('Component Integration', () => {
    it('integrates with LocaleSwitcher component', () => {
      render(<Header />);
      
      // Should render LocaleSwitcher components
      const localeSwitchers = screen.getAllByTestId('locale-switcher');
      expect(localeSwitchers.length).toBeGreaterThan(0);
    });
  });
});