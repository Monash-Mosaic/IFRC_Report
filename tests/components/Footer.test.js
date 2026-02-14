import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Footer from '@/components/Footer';

// Mock next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

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
      'Home.footer.worldDisastersReport': 'World Disasters Report',
      'Home.footer.chapters.title': 'Report Chapters',
      'Home.footer.chapters.chapter1': 'Chapter 1',
      'Home.footer.chapters.chapter2': 'Chapter 2',
      'Home.footer.chapters.chapter3': 'Chapter 3',
      'Home.footer.games.title': 'Disinformation Games',
      'Home.footer.games.disinformer': 'Disinformer',
      'Home.footer.games.ctrlAltPrebunk': 'Ctrl+Alt+Prebunk',
      'Home.footer.social.facebook': 'Facebook',
      'Home.footer.social.linkedin': 'LinkedIn',
      'Home.footer.social.youtube': 'YouTube',
      'Home.footer.social.instagram': 'Instagram',
      'Home.footer.social.x': 'X (Twitter)',
    };
    return translations[`${namespace}.${key}`] || key;
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  X: ({ className, onClick, size, ...props }) => (
    <div className={className} onClick={onClick} data-testid="x-icon" {...props}>
      X Icon
    </div>
  ),
  Linkedin: ({ className, onClick, size, ...props }) => (
    <div className={className} onClick={onClick} data-testid="linkedin-icon" {...props}>
      LinkedIn Icon
    </div>
  ),
  Youtube: ({ className, onClick, size, ...props }) => (
    <div className={className} onClick={onClick} data-testid="youtube-icon" {...props}>
      YouTube Icon
    </div>
  ),
  Instagram: ({ className, onClick, size, ...props }) => (
    <div className={className} onClick={onClick} data-testid="instagram-icon" {...props}>
      Instagram Icon
    </div>
  ),
  Facebook: ({ className, onClick, size, ...props }) => (
    <div className={className} onClick={onClick} data-testid="facebook-icon" {...props}>
      Facebook Icon
    </div>
  ),
  ChevronDown: ({ className, onClick, size, ...props }) => (
    <div className={className} onClick={onClick} data-testid="chevron-down-icon" {...props}>
      Chevron Down Icon
    </div>
  ),
}));

describe('Footer', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  describe('Rendering', () => {
    it('renders the footer component correctly', () => {
      render(<Footer />);

      // Check main title
      expect(screen.getByText('World Disasters Report')).toBeInTheDocument();

      // Check logos
      expect(screen.getByAltText('IFRC')).toBeInTheDocument();
      expect(screen.getByAltText('Mosaic')).toBeInTheDocument();

      // Check section titles (desktop version)
      expect(screen.getAllByText('Report Chapters')).toHaveLength(2); // Mobile + Desktop
      expect(screen.getAllByText('Disinformation Games')).toHaveLength(2); // Mobile + Desktop

      // Check navigation links
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Chapter 2')).toBeInTheDocument();
      expect(screen.getByText('Chapter 3')).toBeInTheDocument();
      expect(screen.getByText('Disinformer')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Alt+Prebunk')).toBeInTheDocument();

      // Check social media icons
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
      expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
      expect(screen.getByTestId('youtube-icon')).toBeInTheDocument();
      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    });

    it('matches snapshot', () => {
      const { container } = render(<Footer />);
      expect(container).toMatchSnapshot();
    });

    it('renders with proper responsive layout classes', () => {
      render(<Footer />);

      const footerElement = screen.getByRole('contentinfo');
      expect(footerElement).toBeInTheDocument();

      // Check for responsive grid classes - look for the div with grid classes directly
      const gridContainer = screen
        .getByRole('contentinfo')
        .querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3');
    });
  });

  describe('Mobile Dropdown Functionality', () => {
    it('shows mobile dropdown buttons on mobile', () => {
      render(<Footer />);

      // Check for mobile dropdown buttons (they should have ChevronDown icons)
      const chevronIcons = screen.getAllByTestId('chevron-down-icon');
      expect(chevronIcons).toHaveLength(2); // One for each section
    });

    it('toggles chapters section dropdown', async () => {
      render(<Footer />);

      // Find the chapters dropdown button - look for button containing "Report Chapters"
      const chaptersButtons = screen.getAllByText('Report Chapters');
      const chaptersButton = chaptersButtons.find((button) => button.closest('button'));
      expect(chaptersButton).toBeInTheDocument();

      // Initially content should be hidden on mobile
      const chapterLinks = screen.getAllByText('Chapter 1');
      expect(chapterLinks[0].closest('ul')).toHaveClass('hidden');

      // Click to expand
      await act(async () => {
        fireEvent.click(chaptersButton.closest('button'));
      });

      // Content should now be visible
      await waitFor(() => {
        const expandedChapterLinks = screen.getAllByText('Chapter 1');
        expect(expandedChapterLinks[0].closest('ul')).toHaveClass('block', 'mt-4');
      });
    });

    it('toggles games section dropdown', async () => {
      render(<Footer />);

      // Find the games dropdown button
      const gamesButtons = screen.getAllByText('Disinformation Games');
      const gamesButton = gamesButtons.find((button) => button.closest('button'));
      expect(gamesButton).toBeInTheDocument();

      // Click to expand
      await act(async () => {
        fireEvent.click(gamesButton.closest('button'));
      });

      // Content should now be visible
      await waitFor(() => {
        const disinformerLink = screen.getByText('Disinformer');
        expect(disinformerLink.closest('ul')).toHaveClass('block', 'mt-4');
      });
    });

    it('closes section when clicking on already open section', async () => {
      render(<Footer />);

      const chaptersButtons = screen.getAllByText('Report Chapters');
      const chaptersButton = chaptersButtons.find((button) => button.closest('button'));

      // Open the section
      await act(async () => {
        fireEvent.click(chaptersButton.closest('button'));
      });

      // Verify it's open
      await waitFor(() => {
        const chapterLinks = screen.getAllByText('Chapter 1');
        expect(chapterLinks[0].closest('ul')).toHaveClass('block', 'mt-4');
      });

      // Click again to close
      await act(async () => {
        fireEvent.click(chaptersButton.closest('button'));
      });

      // Should be closed now
      await waitFor(() => {
        const chapterLinks = screen.getAllByText('Chapter 1');
        expect(chapterLinks[0].closest('ul')).toHaveClass('hidden');
      });
    });

    it('closes other sections when opening a new one', async () => {
      render(<Footer />);

      const chaptersButtons = screen.getAllByText('Report Chapters');
      const chaptersButton = chaptersButtons.find((button) => button.closest('button'));
      const gamesButtons = screen.getAllByText('Disinformation Games');
      const gamesButton = gamesButtons.find((button) => button.closest('button'));

      // Open chapters section
      await act(async () => {
        fireEvent.click(chaptersButton.closest('button'));
      });

      // Verify chapters is open
      await waitFor(() => {
        const chapterLinks = screen.getAllByText('Chapter 1');
        expect(chapterLinks[0].closest('ul')).toHaveClass('block', 'mt-4');
      });

      // Open games section
      await act(async () => {
        fireEvent.click(gamesButton.closest('button'));
      });

      // Verify games is open and chapters is closed
      await waitFor(() => {
        const disinformerLink = screen.getByText('Disinformer');
        expect(disinformerLink.closest('ul')).toHaveClass('block', 'mt-4');

        const chapterLinks = screen.getAllByText('Chapter 1');
        expect(chapterLinks[0].closest('ul')).toHaveClass('hidden');
      });
    });
  });

  describe('Social Media Links', () => {
    it('renders all social media links correctly', () => {
      render(<Footer />);

      // Check social media icons are present
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
      expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
      expect(screen.getByTestId('youtube-icon')).toBeInTheDocument();
      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    });

    it('social media links have correct href attributes', () => {
      render(<Footer />);

      // Get links by their href attributes
      const facebookLink = screen.getByTestId('facebook-icon').closest('a');
      const linkedinLink = screen.getByTestId('linkedin-icon').closest('a');
      const youtubeLink = screen.getByTestId('youtube-icon').closest('a');
      const instagramLink = screen.getByTestId('instagram-icon').closest('a');

      expect(facebookLink).toHaveAttribute('href', '#facebook');
      expect(linkedinLink).toHaveAttribute('href', '#linkedin');
      expect(youtubeLink).toHaveAttribute('href', '#youtube');
      expect(instagramLink).toHaveAttribute('href', '#instagram');
    });

    it('social media links have hover states', () => {
      render(<Footer />);

      const facebookLink = screen.getByTestId('facebook-icon').closest('a');
      expect(facebookLink).toHaveClass('hover:text-gray-600', 'transition-colors');
    });
  });

  describe('Navigation Links', () => {
    it('renders all navigation links with correct href attributes', () => {
      render(<Footer />);

      // Chapter links
      expect(screen.getByText('Chapter 1')).toHaveAttribute('href', '#chapter1');
      expect(screen.getByText('Chapter 2')).toHaveAttribute('href', '#chapter2');
      expect(screen.getByText('Chapter 3')).toHaveAttribute('href', '#chapter3');

      // Game links
      expect(screen.getByText('Disinformer')).toHaveAttribute('href', '#disinformer');
      expect(screen.getByText('Ctrl+Alt+Prebunk')).toHaveAttribute('href', '#ctrl-alt-prebunk');
    });

    it('navigation links have hover states', () => {
      render(<Footer />);

      const chapter1Link = screen.getByText('Chapter 1');
      expect(chapter1Link).toHaveClass('text-gray-600', 'hover:text-gray-900', 'transition-colors');
    });
  });

  describe('Responsive Behavior', () => {
    it('shows desktop headers with proper visibility classes', () => {
      render(<Footer />);

      // Desktop headers should have 'hidden md:block' classes
      const allHeaders = screen.getAllByText('Report Chapters');
      const desktopHeader = allHeaders.find(
        (header) => header.className.includes('hidden') && header.className.includes('md:block')
      );
      expect(desktopHeader).toBeInTheDocument();
    });

    it('shows mobile buttons with proper visibility classes', () => {
      render(<Footer />);

      // Mobile buttons should have 'md:hidden' class
      const allButtons = screen.getAllByText('Report Chapters');
      const mobileButton = allButtons.find((button) =>
        button.closest('button')?.className.includes('md:hidden')
      );
      expect(mobileButton).toBeInTheDocument();
    });

    it('applies correct responsive layout classes', () => {
      render(<Footer />);

      // Check main layout classes - look at the actual rendered structure
      const mainLayout = screen.getByRole('contentinfo').firstChild.firstChild;
      expect(mainLayout).toHaveClass('flex', 'flex-col', 'lg:flex-row');

      // Check content sections responsive classes - navigate to the correct div with the classes
      const contentSection = screen
        .getByRole('contentinfo')
        .querySelector('.lg\\:w-2\\/3.order-1.lg\\:order-2');
      expect(contentSection).toHaveClass('lg:w-2/3', 'order-1', 'lg:order-2');

      // Check logo section responsive classes
      const logoSection = screen
        .getByRole('contentinfo')
        .querySelector('.lg\\:w-1\\/3.order-2.lg\\:order-1');
      expect(logoSection).toHaveClass('lg:w-1/3', 'order-2', 'lg:order-1');
    });
  });

  describe('Logo Rendering', () => {
    it('renders IFRC logo with correct attributes', () => {
      render(<Footer />);

      const ifrcLogo = screen.getByAltText('IFRC');
      expect(ifrcLogo).toHaveAttribute('src', '/wdr25/ifrc_logo.jpg');
      expect(ifrcLogo).toHaveAttribute('width', '120');
      expect(ifrcLogo).toHaveAttribute('height', '40');
    });

    it('renders Mosaic logo with correct attributes', () => {
      render(<Footer />);

      const mosaicLogo = screen.getByAltText('Mosaic');
      expect(mosaicLogo).toHaveAttribute('src', '/wdr25/mosaic_logo.png');
      expect(mosaicLogo).toHaveAttribute('width', '120');
      expect(mosaicLogo).toHaveAttribute('height', '40');
    });

    it('applies correct responsive alignment classes', () => {
      render(<Footer />);

      // Logo section container should have responsive alignment classes - find the correct container
      const logoSectionContainer = screen
        .getByRole('contentinfo')
        .querySelector('.text-center.lg\\:text-left');
      expect(logoSectionContainer).toHaveClass('text-center', 'lg:text-left');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for dropdown buttons', () => {
      render(<Footer />);

      const chaptersButtons = screen.getAllByText('Report Chapters');
      const chaptersButton = chaptersButtons.find((button) => button.closest('button'));
      expect(chaptersButton.closest('button')).toHaveAttribute('aria-expanded', 'false');

      // Test expanding updates aria-expanded
      act(() => {
        fireEvent.click(chaptersButton.closest('button'));
      });

      expect(chaptersButton.closest('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('uses semantic footer element', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<Footer />);

      // Main title should be h3
      const mainTitle = screen.getByRole('heading', { level: 3 });
      expect(mainTitle).toHaveTextContent('World Disasters Report');

      // Section titles should be h4
      const sectionTitles = screen.getAllByRole('heading', { level: 4 });
      expect(sectionTitles).toHaveLength(4); // 3 desktop + 3 mobile headers
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct transition classes for chevron rotation', () => {
      render(<Footer />);

      const chevronIcons = screen.getAllByTestId('chevron-down-icon');
      chevronIcons.forEach((icon) => {
        expect(icon).toHaveClass('transform', 'transition-transform');
      });
    });

    it('applies correct border and spacing classes', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('w-full', 'bg-white', 'border-t', 'border-gray-200');

      const mobileButtons = screen
        .getAllByTestId('chevron-down-icon')
        .map((icon) => icon.closest('button'))
        .filter((button) => button !== null);

      mobileButtons.forEach((button) => {
        expect(button).toHaveClass('py-4', 'border-b', 'border-gray-200');
      });
    });
  });

  describe('Internationalization', () => {
    it('uses translation keys correctly', () => {
      render(<Footer />);

      // Verify translated content is rendered
      expect(screen.getByText('World Disasters Report')).toBeInTheDocument();
      expect(screen.getAllByText('Report Chapters')).toHaveLength(2); // Mobile + Desktop
      expect(screen.getAllByText('Disinformation Games')).toHaveLength(2); // Mobile + Desktop
      expect(screen.getByText('Disinformer')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Alt+Prebunk')).toBeInTheDocument();
    });

    it('uses localized Link component from i18n/navigation', () => {
      render(<Footer />);

      // All internal links should use the i18n Link component
      // This is verified by our mock which renders <a> tags
      const navigationLinks = screen.getAllByRole('link');
      expect(navigationLinks.length).toBeGreaterThan(0);

      // Verify some specific links exist
      expect(screen.getByText('Chapter 1').closest('a')).toHaveAttribute('href', '#chapter1');
      expect(screen.getByText('Disinformer').closest('a')).toHaveAttribute('href', '#disinformer');
    });
  });
});
