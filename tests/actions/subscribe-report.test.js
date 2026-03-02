/**
 * @jest-environment node
 */
const createContactMock = jest.fn();

jest.mock('@getbrevo/brevo', () => ({
  BrevoClient: function MockBrevoClient() {
    this.contacts = { createContact: createContactMock };
  },
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(() =>
    Promise.resolve((key) =>
      key === 'subscribeError' ? "We couldn't add you to the list. Please try again later." : key
    )
  ),
}));

import { subscribeReport } from '@/app/actions/subscribe-report';

describe('subscribeReport server action', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    createContactMock.mockResolvedValue({});
    process.env = {
      ...originalEnv,
      BREVO_API_KEY: 'test_api_key',
      BREVO_LIST_ID: '42',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createFormData(overrides = {}) {
    const fd = new FormData();
    fd.set('email', overrides.email ?? 'user@example.com');
    fd.set('locale', overrides.locale ?? 'en');
    return fd;
  }

  it('sends email and SUBSCRIBE_LOCALE to Brevo and returns success', async () => {
    const formData = createFormData({
      email: 'user@example.com',
      locale: 'zh',
    });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ success: true });
    expect(createContactMock).toHaveBeenCalledTimes(1);
    expect(createContactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        listIds: [42],
        updateEnabled: true,
        attributes: {
          SUBSCRIBE_LOCALE: 'zh',
        },
      })
    );
  });

  it('returns error when email is missing', async () => {
    const formData = createFormData({ email: '' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Email is required' });
    expect(createContactMock).not.toHaveBeenCalled();
  });

  it('returns error for invalid email', async () => {
    const formData = createFormData({ email: 'not-an-email' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Please enter a valid email address.' });
    expect(createContactMock).not.toHaveBeenCalled();
  });

  it('returns localized subscribeError when Brevo SDK throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    createContactMock.mockRejectedValueOnce(new Error('API error'));

    const formData = createFormData();
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({
      error: "We couldn't add you to the list. Please try again later.",
    });
    consoleSpy.mockRestore();
  });
});
