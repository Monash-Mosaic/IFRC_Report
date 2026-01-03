import Carousel from '@/components/Carousel';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useState } from 'react';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: ({ className }) => (
    <div className={className} data-testid="chevron-left-icon">&lt;</div>
  ),
  ChevronRight: ({ className }) => (
    <div className={className} data-testid="chevron-right-icon">&gt;</div>
  ),
}));

// Mock card component for testing
const MockCard = ({ title, description, id }) => (
  <div className="test-card" data-testid={`card-${id}`}>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

// Sample test data
const mockItems = [
  { id: 1, title: "First Item", description: "First description" },
  { id: 2, title: "Second Item", description: "Second description" },
  { id: 3, title: "Third Item", description: "Third description" },
  { id: 4, title: "Fourth Item", description: "Fourth description" },
  { id: 5, title: "Fifth Item", description: "Fifth description" }
];

  const defaultProps = {
    title: "Test Carousel",
    items: mockItems,
    cardComponent: MockCard,
    cardWidth: 288,
    gap: 24
  };

  // Mock HTMLElement.scrollTo method
  HTMLElement.prototype.scrollTo = jest.fn();

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });

describe('Carousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock container dimensions for items per page calculation
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 900 // Container width that fits ~3 cards (288px + 24px gap each)
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders Carousel with all content', () => {
    const { container } = render(<Carousel {...defaultProps} />);
    
    // Should show title
    expect(screen.getByText('Test Carousel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Test Carousel' })).toBeInTheDocument();
    
    // Should render all cards
    mockItems.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
      expect(screen.getByTestId(`card-${item.id}`)).toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });

  it('renders without title when not provided', () => {
    const propsWithoutTitle = { ...defaultProps };
    delete propsWithoutTitle.title;
    
    render(<Carousel {...propsWithoutTitle} />);
    
    // Should not show carousel's main heading (h2)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    
    // Should still render cards (they have h3 headings)
    expect(screen.getByText('First Item')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
  });

  it('renders with different carousel configurations', () => {
    const customProps = {
      title: "Custom Carousel Title",
      items: mockItems.slice(0, 3),
      cardComponent: MockCard,
      cardWidth: 320,
      gap: 32,
      showDots: false,
      showArrows: false,
      className: "custom-carousel",
      containerClassName: "custom-container"
    };
    
    const { container } = render(<Carousel {...customProps} />);
    
    // Should show custom title
    expect(screen.getByText('Custom Carousel Title')).toBeInTheDocument();
    
    // Should render only 3 cards
    expect(container.querySelectorAll('.test-card')).toHaveLength(3);
    
    // Should apply custom classes
    expect(container.querySelector('.custom-carousel')).toBeInTheDocument();
    expect(container.querySelector('.custom-container')).toBeInTheDocument();
  });

  it('shows navigation controls in centered layout when there are multiple pages', async () => {
    const { container } = render(<Carousel {...defaultProps} />);
    
    // Wait for useEffect to calculate items per page
    await waitFor(() => {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
    
    // Should have centered navigation container
    const navigationContainer = container.querySelector('.flex.items-center.justify-center.space-x-4');
    expect(navigationContainer).toBeInTheDocument();
    
    // Both arrows should be visible now (always visible when showArrows is true)
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    
    // Previous button should be disabled initially (currentPage = 0)
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    
    // Next button should be enabled when there are more pages
    expect(screen.getByLabelText('Next page')).toBeEnabled();
  });

  it('hides navigation arrows when showArrows is false', async () => {
    render(<Carousel {...defaultProps} showArrows={false} />);
    
    await waitFor(() => {
      expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
    });
  });

  it('shows numbered page dots with red styling', async () => {
    render(<Carousel {...defaultProps} />);
    
    // Wait for useEffect to calculate pages
    await waitFor(() => {
      // Should show numbered page buttons
      const pageButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.startsWith('Go to page') &&
        button.textContent.match(/^\d+$/) // Contains only numbers
      );
      expect(pageButtons.length).toBeGreaterThan(0);
    });
    
    // Check that page dots show numbers instead of just dots
    const firstPageButton = screen.getByLabelText(/Go to page 1 of/);
    expect(firstPageButton).toHaveTextContent('1');
    
    // Check red styling for active page
    expect(firstPageButton).toHaveClass('bg-red-100', 'text-red-800', 'border-2', 'border-red-500');
  });

  it('hides numbered page dots when showDots is false', async () => {
    render(<Carousel {...defaultProps} showDots={false} />);
    
    await waitFor(() => {
      const pageButtons = screen.queryAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.startsWith('Go to page') &&
        button.textContent.match(/^\d+$/)
      );
      expect(pageButtons).toHaveLength(0);
    });
    
    // Should still show arrows if showArrows is true
    if (screen.queryByLabelText('Next page')) {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    }
  });

  it('handles next button click correctly', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByLabelText('Next page');
    
    act(() => {
      fireEvent.click(nextButton);
    });
    
    // Should call scrollTo with correct position for page 1
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
      left: expect.any(Number), // Position will be calculated based on itemsPerPage
      behavior: 'smooth'
    });
  });

  it('handles previous button click correctly', async () => {
    // Start with a carousel that can show previous button
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
    
    // Previous button should be visible but disabled initially
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
    
    // First click next to enable previous
    const nextButton = screen.getByLabelText('Next page');
    act(() => {
      fireEvent.click(nextButton);
    });
    
    // Now previous button should be enabled
    await waitFor(() => {
      expect(prevButton).toBeEnabled();
    });
    
    act(() => {
      fireEvent.click(prevButton);
    });
    
    // Should call scrollTo to go back to page 0
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
      left: 0, // Back to first page
      behavior: 'smooth'
    });
  });

  it('handles numbered dot navigation correctly', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Go to page 1 of/)).toBeInTheDocument();
    });
    
    // Find numbered page buttons
    const pageButtons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.startsWith('Go to page') &&
      button.textContent.match(/^\d+$/)
    );
    
    if (pageButtons.length > 1) {
      act(() => {
        fireEvent.click(pageButtons[1]); // Click second page button
      });
      
      // Should call scrollTo with correct position for page 1
      expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
        left: expect.any(Number),
        behavior: 'smooth'
      });
    }
  });

  it('shows disabled state for previous button on first page', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    });
    
    const prevButton = screen.getByLabelText('Previous page');
    
    // Should be disabled on first page
    expect(prevButton).toBeDisabled();
    
    // Should have dimmed styling
    expect(prevButton).toHaveClass('bg-red-50', 'border-gray-200', 'cursor-not-allowed');
    
    // Icon should be dimmed
    const chevronIcon = prevButton.querySelector('div[data-testid="chevron-left-icon"]');
    expect(chevronIcon).toHaveClass('text-red-200');
  });

  it('shows disabled state for next button on last page', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
    
    // Navigate to the last page by clicking next buttons until we can't anymore
    const nextButton = screen.getByLabelText('Next page');
    
    // Click through to the last page
    while (!nextButton.disabled) {
      act(() => {
        fireEvent.click(nextButton);
      });
      // Wait a bit for the state to update
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Now next button should be disabled on the last page
    expect(nextButton).toBeDisabled();
    
    // Should have dimmed styling
    expect(nextButton).toHaveClass('bg-red-50', 'border-gray-200', 'cursor-not-allowed');
    
    // Icon should be dimmed
    const chevronIcon = nextButton.querySelector('div[data-testid="chevron-right-icon"]');
    expect(chevronIcon).toHaveClass('text-red-200');
  });

  it('enables buttons when navigation is possible', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByLabelText('Next page');
    
    // Next button should be enabled initially (more pages available)
    expect(nextButton).toBeEnabled();
    expect(nextButton).toHaveClass('bg-red-100', 'border-red-200', 'cursor-pointer');
    
    // Icon should be normal color
    const chevronIcon = nextButton.querySelector('div[data-testid="chevron-right-icon"]');
    expect(chevronIcon).toHaveClass('text-red-700');
  });

  it('has correct card width and gap styling', () => {
    const { container } = render(<Carousel {...defaultProps} />);
    
    // Check gap styling in scroll container
    const scrollContainer = container.querySelector('[style*="gap"]');
    expect(scrollContainer).toHaveStyle('gap: 24px');
    
    // Check card width styling
    const firstCard = container.querySelector('[style*="width: 288px"]');
    expect(firstCard).toBeInTheDocument();
    expect(firstCard).toHaveStyle({
      'width': '288px',
      'min-width': '288px'
    });
  });

  it('has correct navigation layout structure', () => {
    const { container } = render(<Carousel {...defaultProps} />);
    
    // Should have centered navigation container with proper spacing
    const navigationContainer = container.querySelector('.flex.items-center.justify-center.space-x-4');
    expect(navigationContainer).toBeInTheDocument();
    
    // Should have numbered page buttons container
    const pageDotsContainer = container.querySelector('.flex.items-center.space-x-2');
    expect(pageDotsContainer).toBeInTheDocument();
    
    // Check that items container doesn't have absolute positioned arrows anymore
    const itemsContainer = container.querySelector('.relative');
    expect(itemsContainer).toBeInTheDocument();
    
    // Should not have absolute positioned arrows in items container
    const absoluteArrows = itemsContainer?.querySelectorAll('.absolute');
    expect(absoluteArrows?.length || 0).toBe(0);
  });

  it('handles empty items array gracefully', () => {
    const emptyProps = {
      ...defaultProps,
      items: []
    };
    
    expect(() => {
      render(<Carousel {...emptyProps} />);
    }).not.toThrow();
    
    // Should still render title
    expect(screen.getByText('Test Carousel')).toBeInTheDocument();
    
    // Should not render any cards
    expect(screen.queryByTestId('card-1')).not.toBeInTheDocument();
  });

  it('passes additional props to card components', () => {
    const additionalProps = {
      customProp: "test-value",
      anotherProp: 42
    };
    
    const MockCardWithProps = ({ title, customProp, anotherProp, id }) => (
      <div className="test-card" data-testid={`card-${id}`}>
        <h3>{title}</h3>
        <span data-testid="custom-prop">{customProp}</span>
        <span data-testid="another-prop">{anotherProp}</span>
      </div>
    );
    
    render(
      <Carousel
        {...defaultProps}
        cardComponent={MockCardWithProps}
        {...additionalProps}
      />
    );
    
    // Should pass custom props to all cards
    expect(screen.getAllByTestId('custom-prop')[0]).toHaveTextContent('test-value');
    expect(screen.getAllByTestId('another-prop')[0]).toHaveTextContent('42');
  });

  it('has proper semantic HTML structure', async () => {
    const { container } = render(<Carousel {...defaultProps} />);
    
    // Should use semantic section element (check via querySelector since section doesn't always have region role)
    expect(container.querySelector('section')).toBeInTheDocument();
    
    // Should have proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Test Carousel');
    
    // Navigation buttons should have proper labels when visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    });
  });

  it('handles window resize events', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
    
    // Should clean up event listener on unmount
    const { unmount } = render(<Carousel {...defaultProps} />);
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('tests smart pagination with many pages', () => {
    // Create a scenario with many items to test pagination
    const manyItems = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i + 1}`,
      description: `Description ${i + 1}`
    }));

    render(<Carousel {...defaultProps} items={manyItems} />);
    
    // Should not show all 50 page buttons - smart pagination should limit display
    const allButtons = screen.getAllByRole('button');
    const pageButtons = allButtons.filter(button => 
      button.getAttribute('aria-label')?.includes('Go to page') &&
      button.textContent.match(/^\d+$/)
    );
    
    // Should show maximum 5-7 page buttons due to smart pagination
    expect(pageButtons.length).toBeLessThan(8);
    expect(pageButtons.length).toBeGreaterThan(0);
    
    // Should show ellipsis for many pages
    const ellipsis = screen.queryByText('...');
    if (manyItems.length > 15) { // If we have enough items to create many pages
      expect(ellipsis).toBeInTheDocument();
    }
  });

  it('handles items without id using index as key', () => {
    const itemsWithoutId = [
      { title: "Item 1", description: "Desc 1" },
      { title: "Item 2", description: "Desc 2" }
    ];
    
    expect(() => {
      render(<Carousel {...defaultProps} items={itemsWithoutId} />);
    }).not.toThrow();
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('has correct red-themed button styling', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      const nextButton = screen.getByLabelText('Next page');
      
      // Check red-themed styling for navigation arrows
      expect(nextButton).toHaveClass(
        'w-10', 'h-10', 'bg-red-100', 'hover:bg-red-200', 'rounded-full',
        'shadow-md', 'border', 'border-red-200', 'flex', 'items-center', 
        'justify-center', 'transition-all', 'duration-200', 'focus:outline-none'
      );
      
      // Check arrow icon has red color
      const arrowIcon = nextButton.querySelector('[data-testid="chevron-right-icon"]');
      expect(arrowIcon).toHaveClass('text-red-700');
    });
    
    // Check numbered page button styling
    const firstPageButton = screen.getByLabelText(/Go to page 1 of/);
    expect(firstPageButton).toHaveClass('w-8', 'h-8', 'rounded-full', 'bg-red-100', 'text-red-800');
  });

  it('shows active page with correct red styling and border', async () => {
    render(<Carousel {...defaultProps} />);
    
    await waitFor(() => {
      const pageButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Go to page') &&
        button.textContent.match(/^\d+$/)
      );
      
      if (pageButtons.length > 0) {
        // First page button should be active (red styling) by default
        expect(pageButtons[0]).toHaveClass('bg-red-100', 'text-red-800', 'border-2', 'border-red-500');
        
        // Other pages should be inactive (lighter red styling) if they exist
        if (pageButtons.length > 1) {
          expect(pageButtons[1]).toHaveClass('bg-red-50', 'text-red-600', 'border', 'border-red-100');
        }
      }
    });
  });
});