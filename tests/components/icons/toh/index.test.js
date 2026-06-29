import { render } from '@testing-library/react';
import {
  Deprivational,
  Digital,
  Informational,
  Longitudinal,
  Physical,
  Psychological,
  Societal,
  Social,
  tohIcons,
} from '@/components/icons/toh';

const iconComponents = [
  ['Deprivational', Deprivational],
  ['Digital', Digital],
  ['Informational', Informational],
  ['Longitudinal', Longitudinal],
  ['Physical', Physical],
  ['Psychological', Psychological],
  ['Societal', Societal],
  ['Social', Social],
];

describe('TOH icons', () => {
  it.each(iconComponents)('renders %s as an accessible SVG', (_name, Icon) => {
    const { container } = render(<Icon data-testid="toh-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('role', 'img');
  });

  it('exports all icons in tohIcons map', () => {
    expect(Object.keys(tohIcons)).toEqual([
      'deprivational',
      'societal',
      'digital',
      'longitudinal',
      'physical',
      'psychological',
      'social',
      'informational',
    ]);

    Object.values(tohIcons).forEach((Icon) => {
      const { container } = render(<Icon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('accepts custom fill color', () => {
    const { container } = render(<Psychological fill="#000000" />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('fill', '#000000');
  });
});
