import { render, screen } from '@testing-library/react';
import EngagementClient from '@/components/engagement/EngagementClient';

jest.mock('@/components/engagement/TagContainer', () => {
  return function MockTagContainer() {
    return <div data-testid="tag-container">Tag Container</div>;
  };
});

jest.mock('@/components/engagement/QuotesSection', () => {
  return function MockQuotesSection() {
    return <div data-testid="quotes-section">Quotes Section</div>;
  };
});

describe('EngagementClient', () => {
  it('renders TagContainer and QuotesSection', () => {
    render(<EngagementClient />);
    expect(screen.getByTestId('tag-container')).toBeInTheDocument();
    expect(screen.getByTestId('quotes-section')).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<EngagementClient />);
    const mainWrapper = container.querySelector('.max-w-7xl');
    expect(mainWrapper).toBeInTheDocument();
    expect(screen.getByText('Tag Container')).toBeInTheDocument();
    expect(screen.getByText('Quotes Section')).toBeInTheDocument();
  });
});
