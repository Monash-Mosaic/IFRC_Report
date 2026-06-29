import { render, screen, fireEvent } from '@testing-library/react';
import TagContainer, { TAG_CATEGORIES } from '@/components/engagement/TagContainer';

const translations = {
  selectedCount: (params) => `${params?.count ?? 0} selected`,
  'tags.psychological': 'Psychological',
  'tags.societal': 'Societal',
  'tags.social': 'Social',
  'tags.informational': 'Informational',
  'tags.digital_technological': 'Digital/technological',
  'tags.physical': 'Physical',
  'tags.deprivational': 'Deprivational/financial/economic',
  'tags.access_constraints': 'Access constraints and acceptance risks',
  'tags.distorted_needs': 'Distorted needs and demand signals',
  'tags.programme': 'Programme effectiveness and accountability',
  'tags.safety': 'Safety and security of staff and volunteers',
  'tags.community_engagement': 'Community engagement and accountability',
  'tags information_aid': 'Information as aid',
  'tags.prebunking': 'Prebunking and narrative resilience',
  'tags.rumour_tracking': 'Rumour tracking and early warning',
  'tags.trusted_messenger': 'Trusted messengers and local intermediaries',
  'tags.debunking': 'Debunking and corrective communication',
  'tags.partnership': 'Partnership and coordination',
  'tags.regulation': 'Regulation and public policy frameworks',
  'tags.freedom': 'Freedom of expression and information rights',
  'tags.technology_governance': 'Technology governance and platform accountability',
  'tags.principles': 'Humanitarian principles and neutrality'
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key, params) => {
    const value = translations[key];
    return typeof value === 'function'
      ? value(params)
      : value ?? key;
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
