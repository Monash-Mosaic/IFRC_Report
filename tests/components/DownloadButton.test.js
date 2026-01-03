import DownloadButton from '@/components/landing-page/DownloadButton';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Sample test data for different scenarios
const defaultProps = {
  filePath: 'pdfs/wdr25/WDR25-EN.pdf',
  fileName: 'WDR25-EN.pdf',
  children: 'Download PDF'
};

describe('DownloadButton', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      blob: () => Promise.resolve(new Blob(['test content'], { type: 'application/pdf' })),
    });
  });

  it('renders DownloadButton with all content', () => {
    const { container } = render(<DownloadButton {...defaultProps} />);
    
    // Should show button text
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    
    // Should have download icon
    const downloadIcon = container.querySelector('svg');
    expect(downloadIcon).toBeInTheDocument();
    expect(downloadIcon).toHaveAttribute('viewBox', '0 0 16 16');
    
    // Should have proper aria-label
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Download WDR25-EN.pdf');
    
    expect(container).toMatchSnapshot();
  });

  it('renders with different variants and sizes', () => {
    const { rerender } = render(
      <DownloadButton {...defaultProps} variant="filled" size="lg">
        Download Large
      </DownloadButton>
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700', 'px-8', 'py-4', 'text-lg');
    
    // Test outline variant with small size
    rerender(
      <DownloadButton {...defaultProps} variant="outline" size="sm">
        Download Small
      </DownloadButton>
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('border-2', 'border-red-600', 'text-red-600', 'hover:bg-red-600', 'hover:text-white', 'px-4', 'py-2', 'text-sm');
  });

  it('renders with custom className', () => {
    render(
      <DownloadButton {...defaultProps} className="custom-class additional-class">
        Download Custom
      </DownloadButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class', 'additional-class');
  });

  it('handles download functionality correctly', async () => {
    const mockOnDownloadStart = jest.fn();
    const mockOnDownloadComplete = jest.fn();
    
    render(
      <DownloadButton
        {...defaultProps}
        onDownloadStart={mockOnDownloadStart}
        onDownloadComplete={mockOnDownloadComplete}
      />
    );
    
    const button = screen.getByRole('button');
    
    // Click the download button
    fireEvent.click(button);
    
    // Should call onDownloadStart immediately
    expect(mockOnDownloadStart).toHaveBeenCalledTimes(1);
    
    // Should show downloading state (icon instead of text)
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    
    // Should have loading spinner AND download icon
    const spinner = screen.getByRole('button').querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Should have download icon
    const downloadIcon = screen.getByRole('button').querySelector('svg');
    expect(downloadIcon).toBeInTheDocument();
    
    // Wait for download to complete
    await waitFor(() => {
      expect(mockOnDownloadComplete).toHaveBeenCalledTimes(1);
    });
    
    // Should return to normal state
    await waitFor(() => {
      expect(button).toHaveTextContent('Download PDF');
      expect(button).not.toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  it('handles download errors correctly', async () => {
    // Temporarily set NODE_ENV to development to test actual download logic
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const mockOnDownloadError = jest.fn();
    
    // Mock fetch to reject
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <DownloadButton
        {...defaultProps}
        onDownloadError={mockOnDownloadError}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Wait for error handling
    await waitFor(() => {
      expect(mockOnDownloadError).toHaveBeenCalledTimes(1);
      expect(mockOnDownloadError).toHaveBeenCalledWith(expect.any(Error));
    });
    
    // Should return to normal state after error
    await waitFor(() => {
      expect(button).toHaveTextContent('Download PDF');
      expect(button).not.toHaveClass('opacity-50', 'cursor-not-allowed');
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('handles failed response correctly', async () => {
    // Temporarily set NODE_ENV to development to test actual download logic
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const mockOnDownloadError = jest.fn();
    
    // Mock fetch to return failed response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });
    
    render(
      <DownloadButton
        {...defaultProps}
        onDownloadError={mockOnDownloadError}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Wait for error handling
    await waitFor(() => {
      expect(mockOnDownloadError).toHaveBeenCalledTimes(1);
      expect(mockOnDownloadError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Download failed: Not Found')
        })
      );
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('handles disabled state correctly', () => {
    render(<DownloadButton {...defaultProps} disabled={true} />);
    
    const button = screen.getByRole('button');
    
    // Should be disabled
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    
    // Should not respond to clicks
    fireEvent.click(button);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('prevents multiple simultaneous downloads', async () => {
    // Temporarily set NODE_ENV to development to test actual download logic
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<DownloadButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    // Should only call fetch once
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('has correct button styling and behavior', () => {
    render(<DownloadButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Should have base styling classes
    expect(button).toHaveClass(
      'rounded-lg',
      'font-medium',
      'transition-colors',
      'inline-flex',
      'items-center',
      'gap-2',
      'whitespace-nowrap',
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-red-500',
      'focus:ring-offset-2'
    );
    
    // Should have default outline variant styling
    expect(button).toHaveClass('border-2', 'border-red-600', 'text-red-600', 'hover:bg-red-600', 'hover:text-white');
    
    // Should have default medium size styling
    expect(button).toHaveClass('px-6', 'py-3');
  });

  it('has correct layout structure', () => {
    const { container } = render(<DownloadButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Should contain text and icon
    expect(button).toHaveTextContent('Download PDF');
    
    // Should have SVG icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-5', 'h-5', 'flex-shrink-0');
    
    // Icon should be Bootstrap download icon
    const paths = icon.querySelectorAll('path');
    expect(paths).toHaveLength(2); // Download icon has 2 path elements
  });

  it('handles missing or malformed props gracefully', () => {
    // Test with minimal props
    expect(() => {
      render(<DownloadButton filePath="test.pdf" />);
    }).not.toThrow();
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Download file');
  });

  it('has proper semantic HTML structure', () => {
    render(<DownloadButton {...defaultProps} />);
    
    // Should render as button element
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
    
    // Should have proper aria-label
    expect(button).toHaveAttribute('aria-label', 'Download WDR25-EN.pdf');
    
    // Should not be disabled by default
    expect(button).not.toBeDisabled();
    
    // Button elements don't have a 'type' attribute by default in React/Jest
    // They implicitly have type="button" behavior when not in a form
  });

  it('handles different file types correctly', () => {
    const { rerender } = render(
      <DownloadButton
        filePath="pdfs/wdr25/WDR25-ExecutiveSummary-FR.pdf"
        fileName="WDR25-ExecutiveSummary-FR.pdf"
      >
        Télécharger PDF
      </DownloadButton>
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Download WDR25-ExecutiveSummary-FR.pdf');
    expect(button).toHaveTextContent('Télécharger PDF');
    
    // Test with different locale
    rerender(
      <DownloadButton
        filePath="pdfs/wdr25/WDR25-ZH.pdf"
        fileName="WDR25-ZH.pdf"
      >
        Download Chinese
      </DownloadButton>
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Download WDR25-ZH.pdf');
    expect(button).toHaveTextContent('Download Chinese');
  });

  it('calls correct API endpoint with encoded parameters', async () => {
    // Temporarily set NODE_ENV to development to test actual download logic
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const filePath = 'pdfs/wdr25/WDR25 Test File.pdf';
    const fileName = 'WDR25 Test File.pdf';
    
    render(
      <DownloadButton filePath={filePath} fileName={fileName}>
        Download Test File
      </DownloadButton>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should call fetch with properly encoded URL
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/download?filePath=${encodeURIComponent(filePath)}&fileName=${encodeURIComponent(fileName)}`
      );
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('shows different states during download lifecycle', async () => {
    // Test in development environment to see real download behavior  
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const mockOnDownloadStart = jest.fn();
    const mockOnDownloadComplete = jest.fn();
    
    render(
      <DownloadButton
        {...defaultProps}
        onDownloadStart={mockOnDownloadStart}
        onDownloadComplete={mockOnDownloadComplete}
      />
    );
    
    const button = screen.getByRole('button');
    
    // Initial state
    expect(button).toHaveTextContent('Download PDF');
    expect(button).not.toHaveClass('opacity-50');
    
    // Click to start download
    fireEvent.click(button);
    
    // Downloading state (icon instead of text)
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(button).toBeDisabled();
    
    // Should have loading spinner
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'h-5', 'w-5', 'border-b-2', 'border-current');
    
    // Wait for completion
    await waitFor(() => {
      expect(mockOnDownloadComplete).toHaveBeenCalled();
    });
    
    // Final state
    await waitFor(() => {
      expect(button).toHaveTextContent('Download PDF');
      expect(button).not.toHaveClass('opacity-50');
      expect(button).not.toBeDisabled();
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('handles test environment correctly', async () => {
    // This test verifies the test environment branch in the download handler
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    
    const mockOnDownloadStart = jest.fn();
    const mockOnDownloadComplete = jest.fn();
    
    render(
      <DownloadButton
        {...defaultProps}
        onDownloadStart={mockOnDownloadStart}
        onDownloadComplete={mockOnDownloadComplete}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should call callbacks but not fetch
    expect(mockOnDownloadStart).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(mockOnDownloadComplete).toHaveBeenCalled();
    });
    
    // Should not call fetch in test environment
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
});