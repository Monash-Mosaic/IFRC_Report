import { render, screen } from '@testing-library/react';
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

      // Check social media icons
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
      expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
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

      const mainLayout = screen.getByRole('contentinfo').firstChild.firstChild;
      expect(mainLayout).toHaveClass('flex', 'flex-col', 'lg:flex-row');
    });
  });

  describe('Social Media Links', () => {
    it('renders all social media links correctly', () => {
      render(<Footer />);

      // Check social media icons are present
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
      expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    });

    it('social media links have correct href attributes', () => {
      render(<Footer />);

      const facebookLink = screen.getByTestId('facebook-icon').closest('a');
      const linkedinLink = screen.getByTestId('linkedin-icon').closest('a');
      const instagramLink = screen.getByTestId('instagram-icon').closest('a');

      expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/p/IFRC-Solferino-Academy-61572985566986/');
      expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/ifrc-solferino-academy');
      expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/ifrcsolferinoacademy/');
    });

    it('social media links have hover states', () => {
      render(<Footer />);

      const facebookLink = screen.getByTestId('facebook-icon').closest('a');
      expect(facebookLink).toHaveClass('hover:text-gray-600', 'transition-colors');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct responsive layout classes', () => {
      render(<Footer />);

      const mainLayout = screen.getByRole('contentinfo').firstChild.firstChild;
      expect(mainLayout).toHaveClass('flex', 'flex-col', 'lg:flex-row');

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
    it('uses semantic footer element', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<Footer />);

      const mainTitle = screen.getByRole('heading', { level: 3 });
      expect(mainTitle).toHaveTextContent('World Disasters Report');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct border and spacing classes', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('w-full', 'bg-white', 'border-t', 'border-gray-200');
    });
  });

  describe('Internationalization', () => {
    it('uses translation keys correctly', () => {
      render(<Footer />);

      expect(screen.getByText('World Disasters Report')).toBeInTheDocument();
    });

    it('renders links', () => {
      render(<Footer />);

      const navigationLinks = screen.getAllByRole('link');
      expect(navigationLinks.length).toBeGreaterThan(0);
    });
  });
});
