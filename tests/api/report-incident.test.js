/**
 * @jest-environment node
 */
import { POST } from '@/app/api/report-incident/route';

describe('POST /api/report-incident', () => {
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

  function createRequest(body) {
    return new Request('http://localhost/api/report-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 200 and success when Notion accepts the request', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    const request = createRequest({
      description: 'Test issue',
      location: 'https://example.com/page',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
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

  it('returns 400 when body is invalid JSON', async () => {
    const request = new Request('http://localhost/api/report-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 400 when description is missing', async () => {
    const request = createRequest({ location: 'https://example.com' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Description is required');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 400 when description is empty string', async () => {
    const request = createRequest({ description: '   ', location: 'https://example.com' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Description is required');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 500 when NOTION_SECRET is missing', async () => {
    delete process.env.NOTION_SECRET;

    const request = createRequest({ description: 'Test', location: '' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Server configuration error');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 500 when NOTION_INCIDENT_DATABASE_ID is missing', async () => {
    delete process.env.NOTION_INCIDENT_DATABASE_ID;

    const request = createRequest({ description: 'Test', location: '' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Server configuration error');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 502 when Notion API returns not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'validation_error' }),
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const request = createRequest({ description: 'Test', location: '' });
    const response = await POST(request);
    const data = await response.json();
    consoleSpy.mockRestore();

    expect(response.status).toBe(502);
    expect(data.error).toBe('Failed to create incident');
  });
});
