jest.mock('@/lib/db', () => ({
  db: {
    bookmarks: {
      toArray: jest.fn(),
      where: jest.fn(),
      delete: jest.fn(),
      add: jest.fn(),
    },
  },
}));

import { db } from '@/lib/db';
import { getBookmarks, toggleBookmark } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.bookmarks.where.mockReturnValue({
      equals: jest.fn(() => ({ first: db.bookmarks.where.mockFirst })),
    });
    db.bookmarks.where.mockFirst = jest.fn();
  });

  it('returns bookmark section names as a Set', async () => {
    db.bookmarks.toArray.mockResolvedValue([
      { id: 1, sectionName: 'intro' },
      { id: 2, sectionName: 'methods' },
    ]);

    const bookmarks = await getBookmarks();
    expect(bookmarks).toEqual(new Set(['intro', 'methods']));
  });

  it('removes an existing bookmark on toggle', async () => {
    db.bookmarks.where.mockFirst.mockResolvedValue({ id: 7, sectionName: 'intro' });
    db.bookmarks.toArray.mockResolvedValue([]);

    const result = await toggleBookmark('intro');

    expect(db.bookmarks.delete).toHaveBeenCalledWith(7);
    expect(db.bookmarks.add).not.toHaveBeenCalled();
    expect(result).toEqual(new Set());
  });

  it('adds a bookmark when toggling a new section', async () => {
    db.bookmarks.where.mockFirst.mockResolvedValue(undefined);
    db.bookmarks.toArray.mockResolvedValue([{ sectionName: 'methods' }]);

    const result = await toggleBookmark('methods');

    expect(db.bookmarks.add).toHaveBeenCalledWith({ sectionName: 'methods' });
    expect(db.bookmarks.delete).not.toHaveBeenCalled();
    expect(result).toEqual(new Set(['methods']));
  });
});
