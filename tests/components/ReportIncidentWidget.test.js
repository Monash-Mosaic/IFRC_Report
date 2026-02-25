import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ReportIncidentWidget from '@/components/ReportIncidentWidget';

const reportIncidentTranslations = {
  trigger: 'Report an error',
  triggerTooltip: 'Report an error?',
  close: 'Close',
  title: 'Report an error',
  descriptionLabel: 'What went wrong?',
  descriptionPlaceholder: 'Describe the issue...',
  submit: 'Submit',
  submitting: 'Submitting…',
  cancel: 'Cancel',
  success: 'Thank you. Your report has been submitted.',
  error: 'Something went wrong. Please try again.',
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    if (namespace === 'ReportIncident' && reportIncidentTranslations[key]) {
      return reportIncidentTranslations[key];
    }
    return key;
  },
}));

jest.mock('lucide-react', () => ({
  MessageCircle: (props) => <div data-testid="message-circle-icon" {...props} />,
  X: (props) => <div data-testid="x-icon" {...props} />,
}));

describe('ReportIncidentWidget', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  it('renders the floating trigger button', () => {
    render(<ReportIncidentWidget />);
    expect(screen.getByRole('button', { name: /report an error/i })).toBeInTheDocument();
    expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument();
  });

  it('shows tooltip on trigger button', () => {
    render(<ReportIncidentWidget />);
    const button = screen.getByRole('button', { name: /report an error/i });
    expect(button).toHaveAttribute('title', 'Report an error?');
  });

  it('opens form when trigger button is clicked', () => {
    render(<ReportIncidentWidget />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/what went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('closes form when close button is clicked', () => {
    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const closeInDialog = within(dialog).getByRole('button', { name: /close/i });
    fireEvent.click(closeInDialog);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls API with description and location on submit', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));

    const textarea = screen.getByPlaceholderText(/describe the issue/i);
    fireEvent.change(textarea, { target: { value: 'Broken link on chapter 2' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/report-incident',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.description).toBe('Broken link on chapter 2');
      expect(typeof body.location).toBe('string');
    });
  });

  it('shows success message after successful submit', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));
    fireEvent.change(screen.getByPlaceholderText(/describe the issue/i), {
      target: { value: 'Test issue' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/thank you\. your report has been submitted\./i)).toBeInTheDocument();
    });
  });

  it('shows error message when API returns error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to create incident' }),
    });

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));
    fireEvent.change(screen.getByPlaceholderText(/describe the issue/i), {
      target: { value: 'Test issue' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create incident/i)).toBeInTheDocument();
    });
  });

  it('shows generic error message when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));
    fireEvent.change(screen.getByPlaceholderText(/describe the issue/i), {
      target: { value: 'Test issue' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong\. please try again\./i)).toBeInTheDocument();
    });
  });
});
