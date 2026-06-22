import { render, screen, fireEvent } from '@testing-library/react';
import SurveyInsight from '@/components/engagement/SurveyInsight';

jest.mock('lucide-react', () => ({
  Heart: ({ className }) => <span data-testid="heart-icon" className={className} />,
  AlertTriangle: () => <span data-testid="alert-icon" />,
  Shield: () => <span data-testid="shield-icon" />,
  User: () => <span data-testid="user-icon" />,
}));

describe('SurveyInsight', () => {
  it('renders survey cards and progress rows', () => {
    render(<SurveyInsight selectedTag={{}} handleSelectionTag={jest.fn()} />);

    expect(screen.getByText('Survey Insights')).toBeInTheDocument();
    expect(screen.getByText('73.3%')).toBeInTheDocument();
    expect(screen.getByText('Dialogue and community participation')).toBeInTheDocument();
    expect(screen.getAllByTestId('heart-icon').length).toBeGreaterThan(0);
  });

  it('calls handleSelectionTag from survey cards and progress rows', () => {
    const handleSelectionTag = jest.fn();
    render(<SurveyInsight selectedTag={{}} handleSelectionTag={handleSelectionTag} />);

    fireEvent.click(screen.getAllByLabelText('Toggle filter')[0]);
    fireEvent.click(screen.getAllByLabelText('Save insight')[0]);

    expect(handleSelectionTag).toHaveBeenCalledWith('affected');
    expect(handleSelectionTag).toHaveBeenCalledWith('dialogue');
  });

  it('shows selected state on toggled items', () => {
    render(
      <SurveyInsight
        selectedTag={{ affected: true, dialogue: true }}
        handleSelectionTag={jest.fn()}
      />
    );

    const hearts = screen.getAllByTestId('heart-icon');
    expect(hearts.some((icon) => icon.className.includes('fill-red-500'))).toBe(true);
  });
});
