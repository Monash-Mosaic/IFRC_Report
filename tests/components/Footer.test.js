import { render, screen } from '@testing-library/react';
import { act } from 'react';
import Footer from '@/components/Footer';

// Helper to render async server components
async function renderFooter() {
  const FooterResolved = await Footer();
  await act(async () => {
    render(FooterResolved);
  });
}

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock i18n navigation
jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, className }) => (
    <a href={typeof href === 'object' ? JSON.stringify(href) : href} className={className}>
      {children}
    </a>
  ),
}));

// Mock next-intl/server — component is now a server component (async)
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn((namespace) => Promise.resolve((key) => {
    const translations = {
      'Footer.report': 'Report',
      'Footer.readReport': 'Read Report',
      'Footer.downloadReport': 'Download Report',
      'Footer.reportIssue': 'Report an Issue',
      'Footer.games': 'Disinformation Games',
      'Footer.world': 'World',
      'Footer.disasters': 'Disasters',
      'Footer.reportTitle': 'Report',
      'Footer.year': '2025',
    };
    return translations[`${namespace}.${key}`] || key;
  })),
  getLocale: jest.fn(() => Promise.resolve('en')),
}));

// Mock reports module
const mockReadReportLink = {
  pathname: '/reports/[report]',
  params: { report: 'world-disasters-report-2025' },
};
const mockDownloadLink = 'https://example.com/download.pdf';

jest.mock('@/reports', () => ({
  getVisibleReports: jest.fn(() => ({
    wdr25: {
      chapters: {
        'synthesis-en': {
          downloadLink: 'https://example.com/download.pdf',
        },
      },
    },
  })),
  reportUriMap: {
    wdr25: {
      languages: { en: 'world-disasters-report-2025' },
      chapters: {
        synthesis: {
          languages: { en: 'synthesis-en' },
        },
      },
    },
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Facebook: ({ className, size, ...props }) => (
    <svg data-testid="facebook-icon" className={className} {...props} />
  ),
  Linkedin: ({ className, size, ...props }) => (
    <svg data-testid="linkedin-icon" className={className} {...props} />
  ),
  Youtube: ({ className, size, ...props }) => (
    <svg data-testid="youtube-icon" className={className} {...props} />
  ),
  Instagram: ({ className, size, ...props }) => (
    <svg data-testid="instagram-icon" className={className} {...props} />
  ),
}));

describe('Footer', () => {
  describe('Rendering', () => {
    it('renders the footer component correctly', async () => {
      await renderFooter();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('matches snapshot', async () => {
      const FooterResolved = await Footer();
      const { container } = render(FooterResolved);
      expect(container).toMatchSnapshot();
    });

    it('applies correct background and border classes', async () => {
      await renderFooter();
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('w-full', 'bg-white', 'border-t', 'border-gray-200');
    });

    it('renders responsive flex layout', async () => {
      await renderFooter();
      const contentinfo = screen.getByRole('contentinfo');
      const flexContainer = contentinfo.querySelector('.flex.flex-col.xl\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('Logo Rendering', () => {
    it('renders IFRC logo with correct attributes', async () => {
      await renderFooter();
      const ifrcLogo = screen.getByAltText('IFRC');
      expect(ifrcLogo).toHaveAttribute('src', '/wdr25/ifrc_logo.jpg');
      expect(ifrcLogo).toHaveAttribute('width', '120');
      expect(ifrcLogo).toHaveAttribute('height', '40');
    });

    it('renders IFRC logo wrapped in a link to ifrc.org', async () => {
      await renderFooter();
      const ifrcLogo = screen.getByAltText('IFRC');
      const ifrcLink = ifrcLogo.closest('a');
      expect(ifrcLink).toHaveAttribute('href', 'https://www.ifrc.org');
    });

    it('renders Solferino Academy logo with correct attributes', async () => {
      await renderFooter();
      const solferinoLogo = screen.getByAltText('Solferino Academy');
      expect(solferinoLogo).toHaveAttribute('src', '/wdr25/solferino_logo.svg');
      expect(solferinoLogo).toHaveAttribute('width', '150');
      expect(solferinoLogo).toHaveAttribute('height', '40');
    });

    it('renders Solferino Academy logo wrapped in a link', async () => {
      await renderFooter();
      const solferinoLogo = screen.getByAltText('Solferino Academy');
      const solferinoLink = solferinoLogo.closest('a');
      expect(solferinoLink).toHaveAttribute('href', 'https://solferinoacademy.com');
    });

    it('renders Monash Mosaic logo with correct attributes', async () => {
      await renderFooter();
      const mosaicLogo = screen.getByAltText('Monash Mosaic');
      expect(mosaicLogo).toHaveAttribute('src', '/wdr25/mosaic_logo.svg');
      expect(mosaicLogo).toHaveAttribute('width', '260');
      expect(mosaicLogo).toHaveAttribute('height', '50');
    });

    it('renders Monash Mosaic logo wrapped in a link', async () => {
      await renderFooter();
      const mosaicLogo = screen.getByAltText('Monash Mosaic');
      const mosaicLink = mosaicLogo.closest('a');
      expect(mosaicLink).toHaveAttribute('href', 'https://www.mosaic-monash.ai/');
    });
  });

  describe('Social Media Icons', () => {
    it('renders multiple Facebook icons (one per org with Facebook)', async () => {
      await renderFooter();
      const facebookIcons = screen.getAllByTestId('facebook-icon');
      expect(facebookIcons.length).toBeGreaterThanOrEqual(2); // IFRC + Solferino
    });

    it('renders multiple LinkedIn icons', async () => {
      await renderFooter();
      const linkedinIcons = screen.getAllByTestId('linkedin-icon');
      expect(linkedinIcons.length).toBeGreaterThanOrEqual(3); // IFRC + Solferino + Mosaic
    });

    it('renders multiple YouTube icons', async () => {
      await renderFooter();
      const youtubeIcons = screen.getAllByTestId('youtube-icon');
      expect(youtubeIcons.length).toBeGreaterThanOrEqual(2); // IFRC + Solferino
    });

    it('renders multiple Instagram icons', async () => {
      await renderFooter();
      const instagramIcons = screen.getAllByTestId('instagram-icon');
      expect(instagramIcons.length).toBeGreaterThanOrEqual(3); // IFRC + Solferino + Mosaic
    });

    it('IFRC social links have correct hrefs', async () => {
      await renderFooter();
      const allFacebookLinks = screen.getAllByTestId('facebook-icon').map((icon) => icon.closest('a'));
      const ifrcFacebook = allFacebookLinks.find((a) => a?.href.includes('facebook.com/IFRC'));
      expect(ifrcFacebook).toBeTruthy();

      const allYoutubeLinks = screen.getAllByTestId('youtube-icon').map((icon) => icon.closest('a'));
      const ifrcYoutube = allYoutubeLinks.find((a) => a?.href.includes('youtube.com/user/ifrc'));
      expect(ifrcYoutube).toBeTruthy();

      const allLinkedinLinks = screen.getAllByTestId('linkedin-icon').map((icon) => icon.closest('a'));
      const ifrcLinkedin = allLinkedinLinks.find((a) => a?.href.includes('linkedin.com/company/ifrc/'));
      expect(ifrcLinkedin).toBeTruthy();

      const allInstagramLinks = screen.getAllByTestId('instagram-icon').map((icon) => icon.closest('a'));
      const ifrcInstagram = allInstagramLinks.find((a) => a?.href.includes('instagram.com/ifrc'));
      expect(ifrcInstagram).toBeTruthy();
    });

    it('Solferino Academy social links have correct hrefs', async () => {
      await renderFooter();
      const allFacebookLinks = screen.getAllByTestId('facebook-icon').map((icon) => icon.closest('a'));
      const solferinoFacebook = allFacebookLinks.find((a) =>
        a?.href.includes('Solferino-Academy') || a?.href.includes('solferino') || a?.href.includes('61572985566986')
      );
      expect(solferinoFacebook).toBeTruthy();

      const allLinkedinLinks = screen.getAllByTestId('linkedin-icon').map((icon) => icon.closest('a'));
      const solferinoLinkedin = allLinkedinLinks.find((a) =>
        a?.href.includes('ifrc-solferino-academy')
      );
      expect(solferinoLinkedin).toBeTruthy();

      const allInstagramLinks = screen.getAllByTestId('instagram-icon').map((icon) => icon.closest('a'));
      const solferinoInstagram = allInstagramLinks.find((a) =>
        a?.href.includes('ifrcsolferinoacademy')
      );
      expect(solferinoInstagram).toBeTruthy();
    });

    it('Monash Mosaic social links have correct hrefs', async () => {
      await renderFooter();
      const allLinkedinLinks = screen.getAllByTestId('linkedin-icon').map((icon) => icon.closest('a'));
      const mosaicLinkedin = allLinkedinLinks.find((a) =>
        a?.href.includes('mosaic-monash-student-team')
      );
      expect(mosaicLinkedin).toBeTruthy();

      const allInstagramLinks = screen.getAllByTestId('instagram-icon').map((icon) => icon.closest('a'));
      const mosaicInstagram = allInstagramLinks.find((a) =>
        a?.href.includes('mosaic.monash')
      );
      expect(mosaicInstagram).toBeTruthy();
    });

    it('social icons have correct styling classes', async () => {
      await renderFooter();
      const facebookIcon = screen.getAllByTestId('facebook-icon')[0];
      expect(facebookIcon).toHaveClass('p-1', 'text-gray-400', 'hover:text-gray-700', 'transition');
    });
  });

  describe('Navigation Links', () => {
    it('renders the report section with translated heading', async () => {
      await renderFooter();
      expect(screen.getByText('Report')).toBeInTheDocument();
    });

    it('renders Read Report link', async () => {
      await renderFooter();
      expect(screen.getByText('Read Report')).toBeInTheDocument();
    });

    it('renders Download Report link', async () => {
      await renderFooter();
      expect(screen.getByText('Download Report')).toBeInTheDocument();
    });

    it('does not render Report an Issue link', async () => {
      await renderFooter();
      expect(screen.queryByText('Report an Issue')).not.toBeInTheDocument();
    });

    it('renders games section with translated heading', async () => {
      await renderFooter();
      expect(screen.getByText('Disinformation Games')).toBeInTheDocument();
    });

    it('renders Disinformer game link with correct href', async () => {
      await renderFooter();
      const disinformerLink = screen.getByText('Disinformer');
      expect(disinformerLink).toBeInTheDocument();
      expect(disinformerLink.closest('a')).toHaveAttribute('href', '/coming-soon');
    });

    it('renders Ctrl + Alt + Prebunk game link with correct href', async () => {
      await renderFooter();
      const prebunkLink = screen.getByText('Ctrl + Alt + Prebunk');
      expect(prebunkLink).toBeInTheDocument();
      expect(prebunkLink.closest('a')).toHaveAttribute('href', '/coming-soon');
    });

    it('Download Report link uses dynamic download link from reportModule', async () => {
      await renderFooter();
      // Per PR review, downloadReport should use a native <a> tag.
      // This test checks the href regardless of whether it's a Link or <a>.
      const downloadEl = screen.getByText('Download Report');
      const downloadLink = downloadEl.closest('a');
      expect(downloadLink).toHaveAttribute('href', mockDownloadLink);
    });
  });

  describe('Title / Branding', () => {
    it('renders the report title text split across lines', async () => {
      await renderFooter();
      const titleParagraph = screen.getByRole('contentinfo').querySelector('p.font-bold.text-xl');
      expect(titleParagraph).toBeInTheDocument();
      expect(titleParagraph.textContent).toContain('World');
      expect(titleParagraph.textContent).toContain('Disasters');
      expect(titleParagraph.textContent).toContain('Report');
    });

    it('renders the year', async () => {
      await renderFooter();
      expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('applies correct text alignment classes to title section', async () => {
      await renderFooter();
      const contentinfo = screen.getByRole('contentinfo');
      const titleSection = contentinfo.querySelector('[class*="text-right"]');
      expect(titleSection).toBeInTheDocument();
      expect(titleSection).toHaveClass('text-center');
    });
  });

  describe('No Mobile Dropdown Behavior', () => {
    it('does not render any chevron/dropdown icons', async () => {
      await renderFooter();
      expect(screen.queryByTestId('chevron-down-icon')).not.toBeInTheDocument();
    });

    it('does not render any buttons', async () => {
      await renderFooter();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('navigation links are always visible (no hidden class toggling)', async () => {
      await renderFooter();
      expect(screen.getByText('Disinformer')).toBeVisible();
      expect(screen.getByText('Read Report')).toBeVisible();
    });
  });

  describe('Internationalization', () => {
    it('uses the Footer translation namespace', async () => {
      await renderFooter();
      // Translated keys should render
      expect(screen.getByText('Report')).toBeInTheDocument();
      expect(screen.getByText('Read Report')).toBeInTheDocument();
      expect(screen.getByText('Download Report')).toBeInTheDocument();
      expect(screen.getByText('Disinformation Games')).toBeInTheDocument();
      expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('uses locale from getLocale to build report links', async () => {
      const { getLocale } = require('next-intl/server');
      const { getVisibleReports } = require('@/reports');
      await renderFooter();
      expect(getLocale).toHaveBeenCalled();
      expect(getVisibleReports).toHaveBeenCalledWith('en');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic footer element', async () => {
      await renderFooter();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('external links have href attributes', async () => {
      await renderFooter();
      const ifrcLink = screen.getByAltText('IFRC').closest('a');
      expect(ifrcLink).toHaveAttribute('href', 'https://www.ifrc.org');
    });

    it('logo links to ifrc.org have rel="noopener noreferrer" if present', async () => {
      await renderFooter();
      const ifrcLink = screen.getByAltText('IFRC').closest('a');
      expect(ifrcLink).toHaveAttribute('href', 'https://www.ifrc.org');
    });

    it('all logos have meaningful alt text', async () => {
      await renderFooter();
      expect(screen.getByAltText('IFRC')).toBeInTheDocument();
      expect(screen.getByAltText('Solferino Academy')).toBeInTheDocument();
      expect(screen.getByAltText('Monash Mosaic')).toBeInTheDocument();
    });
  });
});
