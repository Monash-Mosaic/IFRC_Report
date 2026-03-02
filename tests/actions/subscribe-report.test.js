/**
 * @jest-environment node
 */
import { subscribeReport } from '@/app/actions/subscribe-report';

describe('subscribeReport server action', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      BREVO_API_KEY: 'test_api_key',
      BREVO_LIST_ID: '42',
    };
    global.fetch = jest.fn();
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
    global.fetch.mockResolvedValueOnce({ ok: true });

    const formData = createFormData({
      email: 'user@example.com',
      location: 'https://example.com/zh/reports/wdr25',
      locale: 'zh',
    });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/contacts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'api-key': 'test_api_key',
          'Content-Type': 'application/json',
        }),
      })
    );

    const fetchBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(fetchBody.email).toBe('user@example.com');
    expect(fetchBody.listIds).toEqual([42]);
    expect(fetchBody.updateEnabled).toBe(true);
    expect(fetchBody.attributes.SUBSCRIBE_PAGE).toBe('https://example.com/zh/reports/wdr25');
    expect(fetchBody.attributes.SUBSCRIBE_LOCALE).toBe('zh');
  });

  it('sends only locale when location is empty', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    const formData = createFormData({ location: '', locale: 'fr' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ success: true });
    const fetchBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(fetchBody.attributes.SUBSCRIBE_LOCALE).toBe('fr');
    expect(fetchBody.attributes.SUBSCRIBE_PAGE).toBeUndefined();
  });

  it('does not add attributes when location and locale are empty', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    const formData = createFormData({ location: '', locale: '' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ success: true });
    const fetchBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(fetchBody.attributes).toBeUndefined();
  });

  it('returns error when email is missing', async () => {
    const formData = createFormData({ email: '' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Email is required' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns error for invalid email', async () => {
    const formData = createFormData({ email: 'not-an-email' });
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Please enter a valid email address.' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns error when Brevo config is missing', async () => {
    delete process.env.BREVO_API_KEY;

    const formData = createFormData();
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Server configuration error' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns error when Brevo API returns not ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ message: 'Error' }) });

    const formData = createFormData();
    const result = await subscribeReport(null, formData);

    expect(result).toEqual({ error: 'Something went wrong. Please try again.' });
  });
});
