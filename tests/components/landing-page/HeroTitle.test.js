import { render, screen } from '@testing-library/react';
import HeroTitle from '@/components/landing-page/HeroTitle';

describe('HeroTitle', () => {
  it('renders title, year, and description', () => {
    render(<HeroTitle title="World Disasters Report" description="Misinformation and trust" />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('World Disasters Report')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Misinformation and trust')).toBeInTheDocument();
  });
});
