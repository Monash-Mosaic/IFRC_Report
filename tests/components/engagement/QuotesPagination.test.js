import { render, screen, fireEvent } from '@testing-library/react';
import QuotesPagination from '@/components/engagement/QuotesPagination';

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
}));

jest.mock('@/i18n/helper', () => ({
  isRtlLocale: (locale) => locale === 'ar',
}));

describe('QuotesPagination', () => {
  it('returns null when only one page exists', () => {
    const { container } = render(
      <QuotesPagination locale="en" page={0} totalPages={1} onPrev={jest.fn()} onNext={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders prev/next controls and handles clicks', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    render(
      <QuotesPagination locale="en" page={1} totalPages={3} onPrev={onPrev} onNext={onNext} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onPrev).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
  });

  it('disables prev on first page and next on last page', () => {
    const { rerender } = render(
      <QuotesPagination locale="en" page={0} totalPages={3} onPrev={jest.fn()} onNext={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();

    rerender(
      <QuotesPagination locale="en" page={2} totalPages={3} onPrev={jest.fn()} onNext={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('uses RTL chevron orientation for Arabic locale', () => {
    render(
      <QuotesPagination locale="ar" page={1} totalPages={3} onPrev={jest.fn()} onNext={jest.fn()} />
    );

    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
  });
});
