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
};

const mockSubscribeReport = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
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

describe('SubscribeBox', () => {
  beforeEach(() => {
    mockSubscribeReport.mockReset();
  });

  it('returns null when showSubscribe is false', () => {
    const { container } = render(<SubscribeBox showSubscribe={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders form with headline and locale hidden input when showSubscribe is true', () => {
    const { container } = render(<SubscribeBox locale="zh" showSubscribe={true} />);
    expect(screen.getByText('Full report is coming soon.')).toBeInTheDocument();
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    const localeInput = document.querySelector('input[name="locale"]');
    expect(localeInput).toBeInTheDocument();
    expect(localeInput).toHaveValue('zh');
  });

  it('headline has bold and IFRC red styling', () => {
    render(<SubscribeBox showSubscribe={true} />);
    const headline = screen.getByText('Full report is coming soon.');
    expect(headline).toHaveClass('font-bold');
    expect(headline).toHaveClass('text-[#ED1B2E]');
  });

  it('success message block is center-aligned', async () => {
    mockSubscribeReport.mockResolvedValue({ success: true });

    const { container } = render(<SubscribeBox locale="en" showSubscribe={true} />);
    const form = container.querySelector('form');
    const emailInput = screen.getByPlaceholderText(/join our email list/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Thank you for joining!')).toBeInTheDocument();
      expect(screen.getByText('We will email you when the new content is available.')).toBeInTheDocument();
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-center');
  });

  it('calls subscribeReport with formData including locale on submit', async () => {
    mockSubscribeReport.mockResolvedValue({ success: true });

    const { container } = render(<SubscribeBox locale="fr" showSubscribe={true} />);
    const form = container.querySelector('form');
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

  it('shows error when action returns error', async () => {
    mockSubscribeReport.mockResolvedValue({ error: 'Please enter a valid email address.' });

    const { container } = render(<SubscribeBox showSubscribe={true} />);
    const form = container.querySelector('form');
    fireEvent.change(screen.getByPlaceholderText(/join our email list/i), {
      target: { value: 'bad' },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });
});
