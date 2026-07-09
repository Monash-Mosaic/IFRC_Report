const mockMount = jest.fn();
const mockDocument = jest.fn(() => ({
  mount: mockMount,
  db: null,
}));

jest.mock('flexsearch', () => ({
  Document: jest.fn((config) => mockDocument(config)),
  Charset: {
    LatinSoundex: 'LatinSoundex',
    CJK: 'CJK',
    Default: { base: true },
    LatinAdvanced: 'LatinAdvanced',
  },
  Encoder: jest.fn((charset, opts) => ({ charset, opts })),
}));

jest.mock('stopwords-en', () => ['the']);

jest.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: jest.fn(),
}));

jest.mock('@/lib/search/d1-database', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((name, config) => ({
    name,
    config,
  })),
}));

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createSearchIndex } from '@/lib/search/db.js';

describe('createSearchIndex', () => {
  const originalNamespace = process.env.NEXT_PUBLIC_GIT_TAG;
  const mockDb = { prepare: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_GIT_TAG;
    getCloudflareContext.mockResolvedValue({
      env: { SEARCH_DB: { withSession: () => mockDb } },
    });
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_GIT_TAG = originalNamespace;
  });

  it('throws for unsupported locales', async () => {
    await expect(createSearchIndex('xx', { engine: 'd1', db: mockDb })).rejects.toThrow(
      'Unsupported locale'
    );
  });

  it('creates an index for each supported locale with locale-specific encoders', async () => {
    for (const locale of ['en', 'zh', 'ar', 'ru', 'es', 'fr']) {
      await createSearchIndex(locale, { db: mockDb, namespace: 'release_1' });
    }

    expect(mockDocument).toHaveBeenCalledTimes(6);
    expect(mockMount).toHaveBeenCalledTimes(6);
  });

  // TODO: Delete this test case
  it.skip('uses English soundex encoder for excerpt field', async () => {
    await createSearchIndex('en', { db: mockDb });

    const config = mockDocument.mock.calls.at(-1)[0];
    const excerptField = config.document.field.find((f) => f.field === 'excerpt');
    expect(excerptField.encoder.opts.filter).toEqual(['the']);
  });

  it('normalizes namespace from env and options', async () => {
    process.env.NEXT_PUBLIC_GIT_TAG = 'Release/1.0';
    const D1Database = (await import('@/lib/search/d1-database')).default;

    await createSearchIndex('en', 'd1');
    expect(D1Database).toHaveBeenCalledWith(
      'ifrc-wdr-playbook-en-db-release_1_0',
      expect.objectContaining({ db: expect.anything() })
    );

    await createSearchIndex('en', { engine: 'd1', db: mockDb, namespace: '  ' });
    expect(D1Database).toHaveBeenCalledWith(
      'ifrc-wdr-playbook-en-db-release_1_0',
      expect.objectContaining({ db: mockDb })
    );
  });

  it('resolves Cloudflare SEARCH_DB binding when db is omitted', async () => {
    await expect(createSearchIndex('en')).resolves.toBeDefined();
    expect(getCloudflareContext).toHaveBeenCalledWith({ async: true });
  });

  it('throws when SEARCH_DB binding is missing', async () => {
    getCloudflareContext.mockResolvedValueOnce({ env: {} });
    await expect(createSearchIndex('en')).rejects.toThrow('SEARCH_DB binding is not configured');
  });
});
