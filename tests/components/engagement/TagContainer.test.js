import { render, screen, fireEvent } from '@testing-library/react';
import TagContainer, { TAG_CATEGORIES } from '@/components/engagement/TagContainer';

jest.mock('next-intl', () => ({
  useTranslations: () => (key, params) => {
    if (key === 'selectedCount') return `${params?.count ?? 0} selected`;
    return key;
  },
}));

jest.mock('lucide-react', () => ({
  Funnel: () => <span data-testid="funnel-icon" />,
}));

describe('TagContainer', () => {
  it('renders browse header and category sections', () => {
    render(<TagContainer selectedTag={{}} handleSelectionTag={jest.fn()} />);

    expect(screen.getByTestId('funnel-icon')).toBeInTheDocument();
    expect(screen.getByText('browseTopics')).toBeInTheDocument();
    TAG_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category.labelKey)).toBeInTheDocument();
    });
  });

  it('shows selected count badge when tags are selected', () => {
    render(
      <TagContainer
        selectedTag={{ psychological: true, social: true }}
        handleSelectionTag={jest.fn()}
      />
    );
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('calls handleSelectionTag when a tag is clicked', () => {
    const handleSelectionTag = jest.fn();
    render(<TagContainer selectedTag={{}} handleSelectionTag={handleSelectionTag} />);

    fireEvent.click(screen.getByRole('button', { name: 'Psychological' }));

    expect(handleSelectionTag).toHaveBeenCalledWith('psychological');
  });

  it('applies selected styles to active tags', () => {
    render(
      <TagContainer
        selectedTag={{ psychological: true }}
        handleSelectionTag={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Psychological' })).toHaveClass('bg-[#ee2435]');
  });
});
