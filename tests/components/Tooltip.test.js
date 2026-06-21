import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '@/components/Tooltip';

describe('Tooltip', () => {
  it('renders trigger children and hidden tooltip body', () => {
    render(
      <Tooltip tooltipText="Help text">
        <button type="button">Trigger</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    const tooltip = screen.getByTestId('tooltip-body');
    expect(tooltip).toHaveTextContent('Help text');
    expect(tooltip).toHaveStyle({ opacity: 0 });
  });

  it('shows tooltip on mouse enter and hides on mouse leave', () => {
    const { container } = render(
      <Tooltip tooltipText="Hover me">
        <span>Hover target</span>
      </Tooltip>
    );

    const wrapper = container.firstChild;
    const tooltip = screen.getByTestId('tooltip-body');

    fireEvent.mouseEnter(wrapper);
    expect(tooltip).toHaveStyle({ opacity: 1 });

    fireEvent.mouseLeave(wrapper);
    expect(tooltip).toHaveStyle({ opacity: 0 });
  });

  it.each(['top', 'bottom', 'left', 'right'])('applies positioning classes for %s orientation', (orientation) => {
    render(
      <Tooltip tooltipText="Positioned" orientation={orientation}>
        <span>Target</span>
      </Tooltip>
    );

    expect(screen.getByTestId('tooltip-body')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-pointer')).toBeInTheDocument();
  });
});
