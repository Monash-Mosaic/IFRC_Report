import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubscribeBox from '@/components/SubscribeBox';

const reportSubscribeTranslations = {
  headline: 'Full report is coming soon.',
  placeholder: 'Join our email list',
  submit: 'Subscribe',
  submitting: 'Subscribing…',
  successTitle: 'Thank you for joining!',
  successMessage: 'We will email you when the new content is available.',
  close: 'Close',
  subscribeError: "We couldn't add you to the list. Please try again later.",
};

const mockSubscribeReport = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: (arg) => (key) => {
    const namespace = typeof arg === 'string' ? arg : arg?.namespace;
    if (namespace === 'ReportSubscribe' && reportSubscribeTranslations[key]) {
      return reportSubscribeTranslations[key];
    }
    return key;
  },
}));

jest.mock('@/app/actions/subscribe-report', () => ({
  subscribeReport: (...args) => mockSubscribeReport(...args),
}));

jest.mock('lucide-react', () => ({
  X: (props) => <span data-testid="x-icon" {...props} />,
}));

beforeAll(() => {
  const reactModal = require('react-modal');
  const Modal = reactModal.default ?? reactModal;
  if (Modal?.setAppElement) Modal.setAppElement(document.body);
});

describe('SubscribeBox', () => {
  beforeEach(() => {
    mockSubscribeReport.mockReset();
  });

  it('renders form with headline and locale hidden input', () => {
    render(<SubscribeBox locale="zh" />);
    expect(screen.getByText('Full report is coming soon.')).toBeInTheDocument();
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    const localeInput = document.querySelector('input[name="locale"]');
    expect(localeInput).toBeInTheDocument();
    expect(localeInput).toHaveValue('zh');
  });

  it('headline has bold and IFRC red styling', () => {
    render(<SubscribeBox locale="en" />);
    const headline = screen.getByText('Full report is coming soon.');
    expect(headline).toHaveClass('font-bold');
    expect(headline).toHaveClass('text-[#ED1B2E]');
  });

  it('shows success in modal after submit', async () => {
    mockSubscribeReport.mockResolvedValue({ success: true });

    render(<SubscribeBox locale="en" />);
    const form = document.querySelector('form');
    const emailInput = screen.getByPlaceholderText(/join our email list/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Thank you for joining!')).toBeInTheDocument();
      expect(screen.getByText('We will email you when the new content is available.')).toBeInTheDocument();
    });

    const alert = document.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('text-center');
  });

  it('calls subscribeReport with formData including locale on submit', async () => {
    mockSubscribeReport.mockResolvedValue({ success: true });

    render(<SubscribeBox locale="fr" />);
    const form = document.querySelector('form');
    const emailInput = screen.getByPlaceholderText(/join our email list/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSubscribeReport).toHaveBeenCalled();
      const [, formData] = mockSubscribeReport.mock.calls[0];
      expect(formData.get('email')).toBe('test@example.com');
      expect(formData.get('locale')).toBe('fr');
    });
  });

  it('shows error in modal when action returns error', async () => {
    mockSubscribeReport.mockResolvedValue({ error: 'Please enter a valid email address.' });

    render(<SubscribeBox locale="en" />);
    const form = document.querySelector('form');
    fireEvent.change(screen.getByPlaceholderText(/join our email list/i), {
      target: { value: 'bad' },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });
});
