/**
 * @jest-environment node
 */
const createContactMock = jest.fn();

jest.mock('@getbrevo/brevo', () => ({
  BrevoClient: function MockBrevoClient() {
    this.contacts = { createContact: createContactMock };
  },
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
    fd.set('location', overrides.location ?? 'https://example.com/en/reports/wdr25');
    fd.set('locale', overrides.locale ?? 'en');
    return fd;
  }

  it('sends email, location and locale to Brevo and returns success', async () => {
    const formData = createFormData({
      email: 'user@example.com',
      location: 'https://example.com/zh/reports/wdr25',
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
          SUBSCRIBE_PAGE: 'https://example.com/zh/reports/wdr25',
          SUBSCRIBE_LOCALE: 'zh',
        },
      })
    );
  });

  it('sends only locale when location is empty', async () => {
    const formData = createFormData({ location: '', locale: 'fr' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ success: true });
    expect(createContactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: {
          SUBSCRIBE_LOCALE: 'fr',
        },
      })
    );
    expect(createContactMock.mock.calls[0][0].attributes.SUBSCRIBE_PAGE).toBeUndefined();
  });

  it('does not add attributes when location and locale are empty', async () => {
    const formData = createFormData({ location: '', locale: '' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ success: true });
    const callArg = createContactMock.mock.calls[0][0];
    expect(callArg.attributes).toBeUndefined();
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

  it('returns error when Brevo config is missing', async () => {
    delete process.env.BREVO_API_KEY;

    const formData = createFormData();
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Server configuration error' });
    expect(createContactMock).not.toHaveBeenCalled();
  });

  it('returns error when Brevo SDK throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    createContactMock.mockRejectedValueOnce(new Error('API error'));

    const formData = createFormData();
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Something went wrong. Please try again.' });
    consoleSpy.mockRestore();
  });
});
