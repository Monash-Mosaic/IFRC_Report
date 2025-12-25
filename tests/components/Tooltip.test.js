import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '@/components/Tooltip';

describe('Tooltip', () => {
  it('shows and hides tooltip text on hover', () => {
    render(
      <Tooltip tooltipText="Helpful info">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const tooltipContainer = screen.getByTestId('tooltip-body');
    const wrapper = tooltipContainer.parentElement;

    expect(tooltipContainer).toHaveStyle({ opacity: '0' });

    fireEvent.mouseEnter(wrapper);
    expect(tooltipContainer).toHaveStyle({ opacity: '1' });

    fireEvent.mouseLeave(wrapper);
    expect(tooltipContainer).toHaveStyle({ opacity: '0' });
  });

  it('applies correct classes for the "top" orientation', () => {
    render(
      <Tooltip tooltipText="Orientation" orientation="top">
        <span>Target</span>
      </Tooltip>,
    );

    const tooltipContainer = screen.getByTestId('tooltip-body');
    const pointer = screen.getByTestId('tooltip-pointer');

    expect(tooltipContainer.className).toContain('bottom-full');
    expect(pointer.className).toContain('top-full');
  });
});
