import D1Database, { concat, toArray } from '@/lib/search/d1-database';

function createMockD1(handlers = {}) {
  const defaultPrepared = {
    bind: (...params) => ({
      all: async () => ({
        results: (handlers.allResults || []).map((row) => ({ ...row })),
      }),
      first: async () => handlers.firstResult ?? null,
      run: async () => handlers.runResult ?? { success: true },
    }),
    all: async () => ({
      results: (handlers.allResults || []).map((row) => ({ ...row })),
    }),
    first: async () => handlers.firstResult ?? null,
    run: async () => handlers.runResult ?? { success: true },
  };

  return {
    prepare: jest.fn(() => defaultPrepared),
    batch: jest.fn(async () => {}),
    exec: jest.fn(async () => {}),
  };
}

describe('d1-database utilities', () => {
  it('concat flattens nested arrays', () => {
    expect(concat([[1, 2], [3], []])).toEqual([1, 2, 3]);
  });

  it('toArray converts map keys to array', () => {
    const map = new Map([['a', 1], ['b', 2]]);
    expect(toArray(map)).toEqual(['a', 'b']);
    expect(toArray(map, true)).toEqual(['a', 'b']);
  });
});

describe('D1Database', () => {
  it('throws when db binding is missing', () => {
    expect(() => new D1Database('test-db')).toThrow('requires `config.db`');
  });

  it('throws for unknown id type', () => {
    const db = createMockD1();
    expect(() => new D1Database('test-db', { db, type: 'unknown' })).toThrow("Unknown type of ID");
  });

  it('accepts object-style constructor config', () => {
    const db = createMockD1();
    const instance = new D1Database({ name: 'scoped-db', db, field: 'title' });
    expect(instance.id).toBe('scoped-db');
    expect(instance.field).toBe('_title');
  });

  it('builds table and index names', () => {
    const db = createMockD1();
    const instance = new D1Database('My Index!', { db, field: 'excerpt' });
    expect(instance.tableName('map')).toBe('map_myindex__excerpt');
    expect(instance.tableName('reg')).toBe('reg_myindex');
    expect(instance.indexName('map', 'key')).toBe('map_key_myindex__excerpt');
    expect(instance.indexName('reg', 'id')).toBe('reg_id_myindex');
  });

  it('opens schema tables on mount without index', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-open', { db });
    await instance.mount({});

    expect(db.batch).toHaveBeenCalled();
    expect(db.prepare).toHaveBeenCalled();
  });

  it('delegates mount to flexsearch when index adapter is present', () => {
    const db = createMockD1();
    const instance = new D1Database('db-mount', { db });
    const mount = jest.fn();
    instance.mount({ index: {}, mount });
    expect(mount).toHaveBeenCalledWith(instance);
  });

  it('closes and clears transaction state', () => {
    const db = createMockD1();
    const instance = new D1Database('db-close', { db });
    expect(instance.close()).toBe(instance);
    expect(instance.db).toBeNull();
  });

  it('destroys and clears tables', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-destroy', { db });
    await instance.destroy();
    expect(db.exec).toHaveBeenCalledWith(expect.stringContaining('DROP TABLE'));
  });

  it('clears table data', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-clear', { db });
    await instance.clear();
    expect(db.exec).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM'));
  });

  it('returns ids from get()', async () => {
    const db = createMockD1({ allResults: [{ id: 'doc-1' }, { id: 'doc-2' }] });
    const instance = new D1Database('db-get', { db });
    const result = await instance.get('climate');
    expect(result).toEqual(['doc-1', 'doc-2']);
  });

  it('returns enriched docs from get()', async () => {
    const db = createMockD1({
      allResults: [{ id: 'doc-1', doc: JSON.stringify({ title: 'A' }) }],
    });
    const instance = new D1Database('db-get-enrich', { db });
    const result = await instance.get('climate', null, 0, 0, true, true);
    expect(result[0].doc).toEqual({ title: 'A' });
  });

  it('returns grouped results when resolve=false', async () => {
    const db = createMockD1({
      allResults: [
        { id: 'doc-1', res: 0 },
        { id: 'doc-2', res: 1 },
      ],
    });
    const instance = new D1Database('db-get-grouped', { db });
    const result = await instance.get('climate', null, 0, 0, false, false);
    expect(result[0]).toEqual(['doc-1']);
    expect(result[1]).toEqual(['doc-2']);
  });

  it('queries contextual get() with tags', async () => {
    const db = createMockD1({ allResults: [{ id: 'doc-1' }] });
    const instance = new D1Database('db-get-ctx', { db });
    await instance.get('key', 'ctx-a', 5, 2, true, false, ['tag', 'news']);
    expect(db.prepare).toHaveBeenCalled();
  });

  it('returns tag matches', async () => {
    const db = createMockD1({ allResults: [{ id: 'doc-9' }] });
    const instance = new D1Database('db-tag', { db });
    const result = await instance.tag('featured', 10, 0, false);
    expect(result).toEqual(['doc-9']);
  });

  it('returns enriched tag matches', async () => {
    const db = createMockD1({ allResults: [{ id: 'doc-9', doc: '{"x":1}' }] });
    const instance = new D1Database('db-tag-enrich', { db });
    const result = await instance.tag('featured', 0, 0, true);
    expect(result).toHaveLength(1);
  });

  it('enriches ids in batches', async () => {
    const db = createMockD1({
      allResults: [{ id: 'a', doc: JSON.stringify({ title: 'A' }) }],
    });
    const instance = new D1Database('db-enrich', { db });
    const single = await instance.enrich('a');
    expect(single[0].doc).toEqual({ title: 'A' });

    const many = await instance.enrich(['a', 'b']);
    expect(Array.isArray(many)).toBe(true);
  });

  it('preserves input id order when enriching', async () => {
    const db = createMockD1({
      allResults: [
        { id: 'a', doc: JSON.stringify({ title: 'A' }) },
        { id: 'b', doc: JSON.stringify({ title: 'B' }) },
        { id: 'c', doc: JSON.stringify({ title: 'C' }) },
      ],
    });
    const instance = new D1Database('db-enrich-order', { db });
    const result = await instance.enrich(['b', 'c', 'a']);
    expect(result.map((row) => row.id)).toEqual(['b', 'c', 'a']);
    expect(result[0].doc).toEqual({ title: 'B' });
  });

  it('drops ids missing from the registry when enriching', async () => {
    const db = createMockD1({
      allResults: [
        { id: 'a', doc: JSON.stringify({ title: 'A' }) },
        { id: 'b', doc: JSON.stringify({ title: 'B' }) },
      ],
    });
    const instance = new D1Database('db-enrich-missing', { db });
    const result = await instance.enrich(['b', 'x', 'a']);
    expect(result.map((row) => row.id)).toEqual(['b', 'a']);
  });

  it('returns empty enrich result for missing docs', async () => {
    const db = createMockD1({ allResults: [] });
    const instance = new D1Database('db-enrich-empty', { db });
    const result = await instance.enrich([]);
    expect(result).toEqual([]);
  });

  it('checks document existence', async () => {
    const db = createMockD1({ firstResult: { exist: 1 } });
    const instance = new D1Database('db-has', { db });
    await expect(instance.has('doc-1')).resolves.toBe(true);
  });

  it('returns false when document is missing', async () => {
    const db = createMockD1({ firstResult: null });
    const instance = new D1Database('db-has-missing', { db });
    await expect(instance.has('missing')).resolves.toBe(false);
  });

  it('returns empty search for invalid query input', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-search-empty', { db });
    await expect(instance.search({}, [], 10)).resolves.toEqual([]);
    await expect(instance.search({}, null, 10)).resolves.toEqual([]);
  });

  it('searches map table for single-term queries', async () => {
    const db = createMockD1({ allResults: [{ id: 'doc-1' }] });
    const instance = new D1Database('db-search-map', { db });
    const result = await instance.search({}, ['climate'], 5);
    expect(result).toEqual(['doc-1']);
  });

  it('searches ctx table for multi-term queries with depth', async () => {
    const db = createMockD1({ allResults: [{ id: 'doc-2' }] });
    const instance = new D1Database('db-search-ctx', { db });
    const result = await instance.search(
      { depth: true, bidirectional: true },
      ['a', 'b'],
      5,
      0,
      false
    );
    expect(result).toEqual(['doc-2']);
  });

  it('applies tag filters during search', async () => {
    const db = createMockD1({ allResults: [{ id: 'doc-3' }] });
    const instance = new D1Database('db-search-tags', { db });
    const query = ['climate'];
    await instance.search({}, query, 5, 0, false, true, false, ['tag', 'news']);
    expect(db.prepare).toHaveBeenCalled();
  });

  it('removes ids in chunks', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-remove', { db });
    await instance.remove('doc-1');
    expect(db.batch).toHaveBeenCalled();

    await instance.remove(['a', 'b']);
    expect(db.batch).toHaveBeenCalledTimes(2);
  });

  it('runs cleanup dedupe statements', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-cleanup', { db });
    await instance.cleanup();
    expect(db.batch).toHaveBeenCalled();
  });

  it('serializes transaction tasks', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-trx', { db });
    const result = await instance.transaction(async function task() {
      return 'ok';
    });
    expect(result).toBe('ok');
  });

  it('waits for in-flight transaction before starting another', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-trx-queue', { db });
    let release;
    const blocker = new Promise((resolve) => {
      release = resolve;
    });

    const first = instance.transaction(() => blocker);
    const second = instance.transaction(async () => 'second');

    release();
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, 'second']);
  });

  it('commits flexsearch in-memory maps to sqlite', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-commit', { db });
    const flexsearch = {
      commit_task: [{ del: 'old-id' }],
      reg: new Map([['doc-1', true]]),
      map: new Map([['climate', [[['doc-1']]]]]),
      ctx: new Map(),
      store: new Map([['doc-1', { title: 'A' }]]),
      tag: new Map([['featured', ['doc-1']]]),
      document: true,
    };

    jest.spyOn(instance, 'remove').mockResolvedValue();
    jest.spyOn(instance, 'cleanup').mockResolvedValue();

    await instance.commit(flexsearch);

    expect(instance.remove).toHaveBeenCalledWith(['old-id']);
    expect(db.batch).toHaveBeenCalled();
    expect(flexsearch.map.size).toBe(0);
    expect(flexsearch.store.size).toBe(0);
  });

  it('commits reg ids when store is disabled', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-commit-reg', { db });
    const flexsearch = {
      commit_task: [],
      reg: new Map([['doc-1', true], ['doc-2', true]]),
      map: new Map(),
      ctx: new Map(),
      bypass: false,
      document: false,
    };

    await instance.commit(flexsearch);
    expect(db.batch).toHaveBeenCalled();
  });

  it('skips commit inserts when reg is empty', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-commit-skip', { db });
    const flexsearch = {
      commit_task: [],
      reg: new Map(),
      map: new Map(),
      ctx: new Map(),
    };

    await instance.commit(flexsearch);
    expect(db.batch).not.toHaveBeenCalled();
  });

  it('promisfy supports all, get, and run', async () => {
    const db = createMockD1({
      allResults: [{ id: 1 }],
      firstResult: { id: 1 },
      runResult: { changes: 1 },
    });
    const instance = new D1Database('db-promisfy', { db });

    await expect(instance.promisfy({ method: 'all', stmt: 'SELECT 1' })).resolves.toEqual([{ id: 1 }]);
    await expect(instance.promisfy({ method: 'get', stmt: 'SELECT 1' })).resolves.toEqual({ id: 1 });
    await expect(instance.promisfy({ method: 'run', stmt: 'DELETE' })).resolves.toEqual({ changes: 1 });
  });

  it('promisfy rejects unsupported methods', async () => {
    const db = createMockD1();
    const instance = new D1Database('db-promisfy-bad', { db });
    await expect(instance.promisfy({ method: 'nope' })).rejects.toThrow('Unsupported method');
  });
});
