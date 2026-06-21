import { render, screen } from '@testing-library/react';
import HeroMediaBlock from '@/components/landing-page/HeroMediaBlock';

jest.mock('@/components/landing-page/HeroVideo', () => {
  return function MockHeroVideo({ alt }) {
    return <div data-testid="hero-video" data-alt={alt} />;
  };
});

jest.mock('@/components/landing-page/HeroTitle', () => {
  return function MockHeroTitle({ title, description }) {
    return (
      <div data-testid="hero-title">
        <span>{title}</span>
        <span>{description}</span>
      </div>
    );
  };
});

describe('HeroMediaBlock', () => {
  it('renders video background and title content', () => {
    render(
      <HeroMediaBlock
        title="Report title"
        description="Report description"
        heroAlt="Hero background"
      />
    );

    expect(screen.getByTestId('hero-video')).toHaveAttribute('data-alt', 'Hero background');
    expect(screen.getByTestId('hero-title')).toBeInTheDocument();
    expect(screen.getByText('Report title')).toBeInTheDocument();
    expect(screen.getByText('Report description')).toBeInTheDocument();
  });
});
