const mockVersion = jest.fn().mockReturnThis();
const mockStores = jest.fn().mockReturnThis();
const mockUpgrade = jest.fn().mockReturnThis();

jest.mock('dexie', () => {
  return jest.fn().mockImplementation(function DexieMock(name) {
    this.name = name;
    this.version = mockVersion;
  });
});

describe('db', () => {
  beforeEach(() => {
    jest.resetModules();
    mockVersion.mockClear();
    mockStores.mockClear();
    mockUpgrade.mockClear();
    mockVersion.mockReturnValue({ stores: mockStores, upgrade: mockUpgrade });
    mockStores.mockReturnValue({ upgrade: mockUpgrade });
  });

  it('creates a Dexie database with expected name and schema versions', async () => {
    const Dexie = (await import('dexie')).default;
    await import('@/lib/db');

    expect(Dexie).toHaveBeenCalledWith('ifrcReportDB');
    expect(mockVersion).toHaveBeenCalledWith(1);
    expect(mockVersion).toHaveBeenCalledWith(2);
    expect(mockVersion).toHaveBeenCalledWith(3);
    expect(mockStores).toHaveBeenCalledWith({
      bookmarks: '++id, sectionName',
    });
    expect(mockStores).toHaveBeenCalledWith({
      bookmarks: '++id, sectionName',
      highlights: '++id, urlKey, createdAt, color, groupId',
    });
  });

  it('backfills groupId during v3 upgrade', async () => {
    const modify = jest.fn((fn) => {
      const highlight = { id: 42 };
      fn(highlight);
      expect(highlight.groupId).toBe(42);
    });
    const toCollection = jest.fn(() => ({ modify }));
    const table = jest.fn(() => ({ toCollection }));

    mockUpgrade.mockImplementation((fn) => {
      fn({ table });
      return { stores: mockStores };
    });

    await import('@/lib/db');
    expect(mockUpgrade).toHaveBeenCalled();
    expect(table).toHaveBeenCalledWith('highlights');
  });

  it('does not overwrite existing groupId during upgrade', async () => {
    const modify = jest.fn((fn) => {
      const highlight = { id: 42, groupId: 'existing' };
      fn(highlight);
      expect(highlight.groupId).toBe('existing');
    });
    mockUpgrade.mockImplementation((fn) => {
      fn({ table: () => ({ toCollection: () => ({ modify }) }) });
      return { stores: mockStores };
    });

    await import('@/lib/db');
    expect(modify).toHaveBeenCalled();
  });
});
