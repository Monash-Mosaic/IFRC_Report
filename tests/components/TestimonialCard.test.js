import TestimonialCard from '@/components/landing-page/TestimonialCard';
import { render, screen } from '@testing-library/react';

// Sample test data for testimonial card
const mockTestimonialData = {
  quote:
    'This is a test testimonial quote that demonstrates the impact of humanitarian work in our community.',
};

const defaultProps = {
  quote: mockTestimonialData.quote,
};

describe('TestimonialCard', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders TestimonialCard with all content', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);

    // Should show quote text with quotation marks
    expect(
      screen.getByText(
        '"This is a test testimonial quote that demonstrates the impact of humanitarian work in our community."'
      )
    ).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('renders with different testimonial data', () => {
    const customProps = {
      quote:
        "Une citation en français qui démontre l'importance du travail humanitaire dans notre région.",
    };

    render(<TestimonialCard {...customProps} />);

    // Should show custom content with quotation marks
    expect(
      screen.getByText(
        '"Une citation en français qui démontre l\'importance du travail humanitaire dans notre région."'
      )
    ).toBeInTheDocument();
  });

  it('has correct card styling and behavior', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);

    // Check main card styling
    const card = container.querySelector(
      '.bg-white.rounded-2xl.p-6.shadow-sm.hover\\:shadow-md.transition-shadow.h-full'
    );
    expect(card).toBeInTheDocument();

    // Check quote styling - now with quotation marks
    const quote = screen.getByText(`"${mockTestimonialData.quote}"`);
    expect(quote.tagName).toBe('BLOCKQUOTE');
    expect(quote).toHaveClass('text-gray-800', 'leading-relaxed', 'mb-6');

    // Check author info container
    const authorContainer = container.querySelector('.flex.items-center.space-x-3.mt-auto');
    expect(authorContainer).toBeInTheDocument();
  });

  it('has correct avatar styling', () => {
    const { container, rerender } = render(<TestimonialCard {...defaultProps} />);

    // Should have gray background for avatar (since no avatar image provided)
    const avatar = container.querySelector(
      '.rounded-full.flex.items-center.justify-center.flex-shrink-0'
    );
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('w-10', 'h-10', 'bg-gray-200');

    // Same props should render consistently
    rerender(<TestimonialCard {...defaultProps} />);
    const newAvatar = container.querySelector(
      '.rounded-full.flex.items-center.justify-center.flex-shrink-0'
    );
    expect(newAvatar).toHaveClass('w-10', 'h-10', 'bg-gray-200');
  });

  it('has correct layout structure', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);

    // Should have main card with correct classes
    const card = container.firstChild;
    expect(card).toHaveClass(
      'bg-white',
      'rounded-2xl',
      'p-6',
      'shadow-sm',
      'hover:shadow-md',
      'transition-shadow',
      'h-full'
    );

    // Should have blockquote for the quote
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveClass('text-gray-800', 'leading-relaxed', 'mb-6');

    // Should have author info section
    const authorSection = container.querySelector('.flex.items-center.space-x-3.mt-auto');
    expect(authorSection).toBeInTheDocument();
  });

  it('handles empty or missing data gracefully', () => {
    const emptyProps = {
      quote: '',
    };

    // Should not crash with empty strings
    expect(() => {
      render(<TestimonialCard {...emptyProps} />);
    }).not.toThrow();

    // Should still render the card structure
    const { container } = render(<TestimonialCard {...emptyProps} />);
    expect(container.querySelector('.bg-white.rounded-2xl')).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(<TestimonialCard {...defaultProps} />);

    // Should use blockquote for the testimonial with quotes
    const blockquote = screen.getByText(`"${mockTestimonialData.quote}"`);
    expect(blockquote.tagName).toBe('BLOCKQUOTE');
  });

  it('uses consistent avatar styling for same names', () => {
    const { container: container1 } = render(<TestimonialCard {...defaultProps} />);
    const avatar1 = container1.querySelector('.rounded-full');
    const avatar1Classes = avatar1.className;

    // Unmount and remount with same name
    const { container: container2 } = render(<TestimonialCard {...defaultProps} />);
    const avatar2 = container2.querySelector('.rounded-full');
    const avatar2Classes = avatar2.className;

    // Should have same styling (gray background)
    expect(avatar1Classes).toBe(avatar2Classes);
    expect(avatar1).toHaveClass('bg-gray-200');
    expect(avatar2).toHaveClass('bg-gray-200');
  });
});
