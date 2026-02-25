/**
 * @jest-environment node
 */
import { reportIncident } from '@/app/actions/report-incident';

describe('reportIncident server action', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NOTION_SECRET: 'secret_test',
      NOTION_INCIDENT_DATABASE_ID: 'database_id_test',
    };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createFormData(overrides = {}) {
    const fd = new FormData();
    fd.set('description', overrides.description ?? 'Test issue');
    fd.set('location', overrides.location ?? 'https://example.com/page');
    return fd;
  }

  it('returns { success: true } when Notion accepts the request', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    const formData = createFormData({ description: 'Test issue', location: 'https://example.com/page' });
    const result = await reportIncident(null, formData);

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notion.com/v1/pages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer secret_test',
          'Notion-Version': '2022-06-28',
        }),
      })
    );

    const fetchBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(fetchBody.parent).toEqual({ database_id: 'database_id_test' });
    expect(fetchBody.properties['Incident ID'].title[0].text.content).toMatch(
      /^IFMS-\d{8}-\d{6}-[0-9a-f]{2}$/
    );
    expect(fetchBody.properties.Details.rich_text[0].text.content).toBe('Test issue');
    expect(fetchBody.properties.Location.url).toBe('https://example.com/page');
  });

  it('returns { error } when description is missing', async () => {
    const formData = createFormData({ description: '' });
    const result = await reportIncident(null, formData);

    expect(result).toEqual({ error: 'Description is required' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns { error } when description is empty after trim', async () => {
    const formData = createFormData({ description: '   ' });
    const result = await reportIncident(null, formData);

    expect(result).toEqual({ error: 'Description is required' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns { error } when NOTION_SECRET is missing', async () => {
    delete process.env.NOTION_SECRET;

    const formData = createFormData({ description: 'Test', location: '' });
    const result = await reportIncident(null, formData);

    expect(result).toEqual({ error: 'Server configuration error', code: 'missing_secret' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns { error } when NOTION_INCIDENT_DATABASE_ID is missing', async () => {
    delete process.env.NOTION_INCIDENT_DATABASE_ID;

    const formData = createFormData({ description: 'Test', location: '' });
    const result = await reportIncident(null, formData);

    expect(result).toEqual({ error: 'Server configuration error', code: 'missing_database_id' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns { error } when Notion API returns not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'validation_error' }),
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const formData = createFormData({ description: 'Test', location: '' });
    const result = await reportIncident(null, formData);
    consoleSpy.mockRestore();

    expect(result).toEqual({ error: 'Failed to create incident' });
  });
});
