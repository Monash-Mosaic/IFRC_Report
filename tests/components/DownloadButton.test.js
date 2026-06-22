import { render, screen, fireEvent } from '@testing-library/react';
import DownloadLink from '@/components/DownloadButton';

const trackPdfDownload = jest.fn();

jest.mock('@/lib/gtm', () => ({
  trackPdfDownload: (...args) => trackPdfDownload(...args),
}));

describe('DownloadButton', () => {
  beforeEach(() => {
    trackPdfDownload.mockClear();
  });

  it('renders download link with children', () => {
    render(
      <DownloadLink url="https://example.com/report.pdf" chapter="synthesis" language="en">
        Download PDF
      </DownloadLink>
    );

    const link = screen.getByRole('link', { name: 'Download PDF' });
    expect(link).toHaveAttribute('href', 'https://example.com/report.pdf');
    expect(link).toHaveAttribute('download');
  });

  it('tracks PDF download and calls optional onClick handler', () => {
    const onClick = jest.fn();

    render(
      <DownloadLink
        url="https://example.com/report.pdf"
        chapter="chapter-1"
        language="fr"
        onClick={onClick}
        ariaLabel="Download chapter"
      >
        Download
      </DownloadLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Download chapter' }));

    expect(trackPdfDownload).toHaveBeenCalledWith({
      url: 'https://example.com/report.pdf',
      chapter: 'chapter-1',
      language: 'fr',
    });
    expect(onClick).toHaveBeenCalled();
  });
});
