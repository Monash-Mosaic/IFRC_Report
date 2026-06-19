import { render, screen } from '@testing-library/react';
import DiscoverHero from '@/components/engagement/DiscoverHero';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('DiscoverHero', () => {
  it('renders banner image with default alt text', () => {
    render(<DiscoverHero />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/engagement/discover-banner.webp');
    expect(image).toHaveAttribute('alt', 'Discover the Interactive Playbook');
  });

  it('accepts custom image source and alt text', () => {
    render(<DiscoverHero imageSrc="/custom/banner.webp" imageAlt="Custom banner" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/custom/banner.webp');
    expect(image).toHaveAttribute('alt', 'Custom banner');
  });
});
