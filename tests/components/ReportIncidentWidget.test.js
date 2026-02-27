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

const mockReportIncident = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    if (namespace === 'ReportIncident' && reportIncidentTranslations[key]) {
      return reportIncidentTranslations[key];
    }
    return key;
  },
}));

jest.mock('@/app/actions/report-incident', () => ({
  reportIncident: (...args) => mockReportIncident(...args),
}));

jest.mock('lucide-react', () => ({
  MessageCircle: (props) => <div data-testid="message-circle-icon" {...props} />,
  X: (props) => <div data-testid="x-icon" {...props} />,
}));

describe('ReportIncidentWidget', () => {
  beforeEach(() => {
    mockReportIncident.mockReset();
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

  it('submits form with description and location via server action', async () => {
    mockReportIncident.mockResolvedValue({ success: true });

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));

    const textarea = screen.getByPlaceholderText(/describe the issue/i);
    fireEvent.change(textarea, { target: { value: 'Broken link on chapter 2' } });

    const form = screen.getByTestId('report-incident-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockReportIncident).toHaveBeenCalledTimes(1);
      const [prevState, formData] = mockReportIncident.mock.calls[0];
      expect(prevState).toEqual({ success: false, error: null });
      expect(formData.get('description')).toBe('Broken link on chapter 2');
      expect(typeof formData.get('location')).toBe('string');
    });
  });

  it('shows success message after successful submit', async () => {
    mockReportIncident.mockResolvedValue({ success: true });

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));
    fireEvent.change(screen.getByPlaceholderText(/describe the issue/i), {
      target: { value: 'Test issue' },
    });
    fireEvent.submit(screen.getByTestId('report-incident-form'));

    await waitFor(() => {
      expect(screen.getByText(/thank you\. your report has been submitted\./i)).toBeInTheDocument();
    });
  });

  it('shows error message when action returns error', async () => {
    mockReportIncident.mockResolvedValue({ error: 'Failed to create incident' });

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));
    fireEvent.change(screen.getByPlaceholderText(/describe the issue/i), {
      target: { value: 'Test issue' },
    });
    fireEvent.submit(screen.getByTestId('report-incident-form'));

    await waitFor(() => {
      expect(screen.getByText(/failed to create incident/i)).toBeInTheDocument();
    });
  });

  it('shows server configuration error when action returns it', async () => {
    mockReportIncident.mockResolvedValue({ error: 'Server configuration error' });

    render(<ReportIncidentWidget />);
    fireEvent.click(screen.getByRole('button', { name: /report an error/i }));
    fireEvent.change(screen.getByPlaceholderText(/describe the issue/i), {
      target: { value: 'Test issue' },
    });
    fireEvent.submit(screen.getByTestId('report-incident-form'));

    await waitFor(() => {
      expect(screen.getByText(/server configuration error/i)).toBeInTheDocument();
    });
  });
});
