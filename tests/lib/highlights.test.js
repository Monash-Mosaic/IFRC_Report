jest.mock('@/lib/db', () => ({
  db: {
    highlights: {
      add: jest.fn(),
      delete: jest.fn(),
      bulkDelete: jest.fn(),
      where: jest.fn(),
    },
  },
}));

import { db } from '@/lib/db';
import {
  addHighlight,
  getHighlightsByUrlKey,
  deleteHighlight,
  deleteHighlightGroup,
  serializeRange,
  restoreRange,
} from '@/lib/highlights';

describe('highlights storage helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.highlights.where.mockReturnValue({
      equals: jest.fn(() => ({ toArray: db.highlights.where.mockToArray })),
    });
    db.highlights.where.mockToArray = jest.fn();
  });

  it('adds a highlight record', async () => {
    db.highlights.add.mockResolvedValue(1);
    const highlight = { urlKey: '/page', color: 'yellow' };
    await addHighlight(highlight);
    expect(db.highlights.add).toHaveBeenCalledWith(highlight);
  });

  it('loads highlights by url key', async () => {
    const rows = [{ id: 1, urlKey: '/page' }];
    db.highlights.where.mockToArray.mockResolvedValue(rows);
    await expect(getHighlightsByUrlKey('/page')).resolves.toEqual(rows);
    expect(db.highlights.where).toHaveBeenCalledWith('urlKey');
  });

  it('deletes a highlight by id', async () => {
    await deleteHighlight(5);
    expect(db.highlights.delete).toHaveBeenCalledWith(5);
  });

  it('deletes all highlights in a group', async () => {
    db.highlights.where.mockReturnValueOnce({
      equals: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      })),
    });

    await deleteHighlightGroup('group-a');
    expect(db.highlights.bulkDelete).toHaveBeenCalledWith([1, 2]);
  });
});

describe('serializeRange / restoreRange', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <article id="container">
        <p id="para"><span>Hello </span><strong>world</strong></p>
      </article>
    `;
    container = document.getElementById('container');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('serializes and restores a text selection range', () => {
    const textNode = document.getElementById('para').firstChild.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);

    const serialized = serializeRange(range, container);
    const restored = restoreRange(serialized, container);

    expect(restored).not.toBeNull();
    expect(restored.toString()).toBe('Hello');
  });

  it('returns null when serialized paths cannot be resolved', () => {
    const restored = restoreRange(
      {
        startPath: [999],
        startOffset: 0,
        endPath: [999],
        endOffset: 1,
      },
      container
    );
    expect(restored).toBeNull();
  });

  it('returns null when resolved nodes have no text children', () => {
    const empty = document.createElement('div');
    container.appendChild(empty);

    const range = document.createRange();
    range.setStart(empty, 0);
    range.setEnd(empty, 0);

    const serialized = serializeRange(range, container);
    const restored = restoreRange(serialized, container);
    expect(restored).toBeNull();
  });

  it('clamps offsets to text node length', () => {
    const textNode = document.getElementById('para').firstChild.firstChild;
    const serialized = {
      startPath: serializeRange(
        (() => {
          const r = document.createRange();
          r.setStart(textNode, 0);
          r.setEnd(textNode, 1);
          return r;
        })(),
        container
      ).startPath,
      startOffset: 0,
      endPath: serializeRange(
        (() => {
          const r = document.createRange();
          r.setStart(textNode, 0);
          r.setEnd(textNode, 1);
          return r;
        })(),
        container
      ).endPath,
      endOffset: 999,
    };

    const restored = restoreRange(serialized, container);
    expect(restored.toString().length).toBeLessThanOrEqual(textNode.textContent.length);
  });
});
