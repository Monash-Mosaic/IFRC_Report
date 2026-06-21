import { render, screen } from '@testing-library/react';
import SearchInputFallback from '@/components/SearchInputFallback';

jest.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon" />,
}));

describe('SearchInputFallback', () => {
  it('renders disabled search input and button', () => {
    render(<SearchInputFallback label="Search" placeholder="Search placeholder" />);

    const input = screen.getByPlaceholderText('Search placeholder');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('readonly');

    const button = screen.getByRole('button', { name: 'Search', hidden: true });
    expect(button).toBeDisabled();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
});
