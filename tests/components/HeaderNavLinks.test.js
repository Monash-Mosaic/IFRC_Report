import { render, screen } from '@testing-library/react';
import HeaderNavLinks from '@/components/HeaderNavLinks';

let mockPathname = '/';

jest.mock('@/i18n/navigation', () => ({
  usePathname: () => mockPathname,
  Link: ({ children, href, className, ...props }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

const links = [
  { href: '/', label: 'Home' },
  { href: '/discover', label: 'Discover' },
  { href: '/about', label: 'About' },
];

describe('HeaderNavLinks', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('renders all navigation links', () => {
    render(<HeaderNavLinks links={links} />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Discover' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('marks active link on exact home path', () => {
    render(<HeaderNavLinks links={links} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Discover' })).not.toHaveAttribute('aria-current');
  });

  it('marks active link for nested paths', () => {
    mockPathname = '/discover/quotes';
    render(<HeaderNavLinks links={links} />);
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('aria-current', 'page');
  });

  it('applies mobile layout classes when mobile prop is true', () => {
    render(<HeaderNavLinks links={links} mobile />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('block', 'py-2');
  });
});
