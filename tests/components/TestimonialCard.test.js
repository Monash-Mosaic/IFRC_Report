import TestimonialCard from '@/components/landing-page/TestimonialCard';
import { render, screen } from '@testing-library/react';

// Sample test data for testimonial card
const mockTestimonialData = {
  quote: "This is a test testimonial quote that demonstrates the impact of humanitarian work in our community.",
  name: "John Doe",
  country: "United States"
};

const defaultProps = {
  quote: mockTestimonialData.quote,
  name: mockTestimonialData.name,
  country: mockTestimonialData.country
};

describe('TestimonialCard', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders TestimonialCard with all content', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);
    
    // Should show quote text
    expect(screen.getByText('This is a test testimonial quote that demonstrates the impact of humanitarian work in our community.')).toBeInTheDocument();
    
    // Should show author name
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Should show country
    expect(screen.getByText('United States')).toBeInTheDocument();
    
    // Should show initials in avatar
    expect(screen.getByText('JD')).toBeInTheDocument();
    
    expect(container).toMatchSnapshot();
  });

  it('renders with different testimonial data', () => {
    const customProps = {
      quote: "Une citation en français qui démontre l'importance du travail humanitaire dans notre région.",
      name: "Marie Dubois",
      country: "France"
    };
    
    render(<TestimonialCard {...customProps} />);
    
    // Should show custom content
    expect(screen.getByText('Une citation en français qui démontre l\'importance du travail humanitaire dans notre région.')).toBeInTheDocument();
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('MD')).toBeInTheDocument();
  });

  it('generates correct initials from names', () => {
    // Test single name
    const singleNameProps = {
      quote: "Test quote",
      name: "Madonna",
      country: "Italy"
    };
    
    const { rerender } = render(<TestimonialCard {...singleNameProps} />);
    expect(screen.getByText('M')).toBeInTheDocument();
    
    // Test multiple names
    const multipleNameProps = {
      quote: "Test quote",
      name: "Jean Claude Van Damme",
      country: "Belgium"
    };
    
    rerender(<TestimonialCard {...multipleNameProps} />);
    expect(screen.getByText('JCVD')).toBeInTheDocument();
    
    // Test names with lowercase
    const lowercaseProps = {
      quote: "Test quote",
      name: "anna smith",
      country: "UK"
    };
    
    rerender(<TestimonialCard {...lowercaseProps} />);
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('has correct card styling and behavior', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);
    
    // Check main card styling
    const card = container.querySelector('.bg-white.rounded-2xl.p-6.shadow-sm.hover\\:shadow-md.transition-shadow.h-full');
    expect(card).toBeInTheDocument();
    
    // Check quote styling
    const quote = screen.getByText(mockTestimonialData.quote);
    expect(quote.tagName).toBe('BLOCKQUOTE');
    expect(quote).toHaveClass('text-gray-800', 'leading-relaxed', 'mb-6');
    
    // Check author info container
    const authorContainer = container.querySelector('.flex.items-center.space-x-3.mt-auto');
    expect(authorContainer).toBeInTheDocument();
  });

  it('has correct avatar color generation', () => {
    const { container, rerender } = render(<TestimonialCard {...defaultProps} />);
    
    // Should have some background color for avatar
    const avatar = container.querySelector('.rounded-full.flex.items-center.justify-center.flex-shrink-0');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('w-10', 'h-10');
    
    // Avatar should have one of the predefined colors
    const avatarClasses = avatar.className;
    const hasValidColor = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
    ].some(color => avatarClasses.includes(color));
    expect(hasValidColor).toBe(true);
    
    // Same name should always generate same color
    rerender(<TestimonialCard {...defaultProps} />);
    const newAvatar = container.querySelector('.rounded-full.flex.items-center.justify-center.flex-shrink-0');
    expect(newAvatar.className).toBe(avatar.className);
  });

  it('has correct layout structure', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);
    
    // Should have main card with correct classes
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-2xl', 'p-6', 'shadow-sm', 'hover:shadow-md', 'transition-shadow', 'h-full');
    
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
      quote: "",
      name: "",
      country: ""
    };
    
    // Should not crash with empty strings
    expect(() => {
      render(<TestimonialCard {...emptyProps} />);
    }).not.toThrow();
    
    // Should still render the card structure
    const { container } = render(<TestimonialCard {...emptyProps} />);
    expect(container.querySelector('.bg-white.rounded-2xl')).toBeInTheDocument();
  });

  it('handles special characters in names correctly', () => {
    const specialCharProps = {
      quote: "Test quote with special characters",
      name: "José María García-López",
      country: "España"
    };
    
    render(<TestimonialCard {...specialCharProps} />);
    
    // Should show the full name
    expect(screen.getByText('José María García-López')).toBeInTheDocument();
    expect(screen.getByText('España')).toBeInTheDocument();
    
    // Should generate initials correctly (first letter of each part)
    expect(screen.getByText('JMG')).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(<TestimonialCard {...defaultProps} />);
    
    // Should use blockquote for the testimonial
    const blockquote = screen.getByText(mockTestimonialData.quote);
    expect(blockquote.tagName).toBe('BLOCKQUOTE');
    
    // Name should be in a div with proper styling
    const nameElement = screen.getByText('John Doe');
    expect(nameElement).toHaveClass('font-medium', 'text-gray-900', 'text-sm');
    
    // Country should be in a div with proper styling
    const countryElement = screen.getByText('United States');
    expect(countryElement).toHaveClass('text-gray-600', 'text-sm');
  });

  it('uses consistent color generation for same names', () => {
    const { container: container1 } = render(<TestimonialCard {...defaultProps} />);
    const avatar1 = container1.querySelector('.rounded-full');
    const avatar1Classes = avatar1.className;
    
    // Unmount and remount with same name
    const { container: container2 } = render(<TestimonialCard {...defaultProps} />);
    const avatar2 = container2.querySelector('.rounded-full');
    const avatar2Classes = avatar2.className;
    
    // Should have same color
    expect(avatar1Classes).toBe(avatar2Classes);
  });

  it('displays avatar initials with correct styling', () => {
    render(<TestimonialCard {...defaultProps} />);
    
    const initials = screen.getByText('JD');
    expect(initials).toHaveClass('text-white', 'text-sm', 'font-medium');
    
    // Should be uppercase
    expect(initials.textContent).toBe('JD');
    expect(initials.textContent).not.toBe('jd');
  });
});