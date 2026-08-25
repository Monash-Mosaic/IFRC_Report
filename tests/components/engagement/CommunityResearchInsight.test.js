import { render, screen } from '@testing-library/react';
import CommunityResearchInsight from '@/components/engagement/CommunityResearchInsight';

jest.mock('lucide-react', () => ({
  QuoteIcon: () => <span data-testid="quote-icon" />,
}));

describe('CommunityResearchInsight', () => {
  it('renders insight card structure', () => {
    render(<CommunityResearchInsight />);

    expect(screen.getByTestId('quote-icon')).toBeInTheDocument();
    expect(screen.getByText('Community Researchers insights')).toBeInTheDocument();
    expect(screen.getByText(/Misinformation often results/i)).toBeInTheDocument();
  });
});
