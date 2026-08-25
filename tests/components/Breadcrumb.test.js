import { render, screen } from '@testing-library/react';
import { act } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

jest.mock('server-only', () => ({}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(async () => (key) => key),
}));

jest.mock('@/i18n/helper', () => ({
  isRtlLocale: (locale) => locale === 'ar',
}));

jest.mock('lucide-react', () => ({
  Home: () => <span data-testid="home-icon" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  ChevronLeft: () => <span data-testid="chevron-left" />,
}));

async function renderBreadcrumb(props = {}) {
  const element = await Breadcrumb({
    locale: 'en',
    ariaLabel: 'Breadcrumb',
    items: [],
    ...props,
  });
  await act(async () => {
    render(element);
  });
}

describe('Breadcrumb', () => {
  it('renders navigation with home link', async () => {
    await renderBreadcrumb();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '' })).toHaveAttribute('href', '/');
  });

  it('renders linked items with href', async () => {
    await renderBreadcrumb({
      items: [{ label: 'Discover', href: '/discover' }],
    });
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover');
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });

  it('renders current page item without link', async () => {
    await renderBreadcrumb({
      items: [{ label: 'Current Page' }],
    });
    expect(screen.getByText('Current Page')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Current Page' })).not.toBeInTheDocument();
  });

  it('uses translation keys when item.key is provided', async () => {
    await renderBreadcrumb({
      items: [{ key: 'discover', href: '/discover' }],
    });
    expect(screen.getByRole('link', { name: 'discover' })).toBeInTheDocument();
  });

  it('uses chevron-left separator for RTL locales', async () => {
    await renderBreadcrumb({
      locale: 'ar',
      items: [{ label: 'About', href: '/about' }],
    });
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    expect(screen.queryByTestId('chevron-right')).not.toBeInTheDocument();
  });
});
