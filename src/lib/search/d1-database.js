export function concat(arrays) {
  return [].concat.apply([], arrays);
}

export function toArray(val, stringify) {
  const result = [];
  for (const key of val.keys()) {
    result.push(stringify ? '' + key : key);
  }
  return result;
}

const MAXIMUM_QUERY_VARS = 100;
const types = {
  text: 'text',
  char: 'text',
  varchar: 'text',
  string: 'text',
  number: 'int',
  numeric: 'int',
  integer: 'int',
  smallint: 'int',
  tinyint: 'int',
  mediumint: 'int',
  int: 'int',
  int8: 'int',
  uint8: 'int',
  int16: 'int',
  uint16: 'int',
  int32: 'int',
  uint32: 'bigint',
  int64: 'bigint',
  bigint: 'bigint',
};

function sanitize(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9_]/g, '');
}

const TRX = Object.create(null);

function prepareStatement(db, stmt, params = []) {
  const prepared = db.prepare(stmt);
  return params.length ? prepared.bind(...params) : prepared;
}

async function queryAll(db, stmt, params = []) {
  const result = await prepareStatement(db, stmt, params).all();
  return result?.results || [];
}

async function queryFirst(db, stmt, params = []) {
  return prepareStatement(db, stmt, params).first();
}

async function runStatement(db, stmt, params = []) {
  return prepareStatement(db, stmt, params).run();
}

async function execBatches(db, statements, batchSize = 64) {
  for (let i = 0; i < statements.length; i += batchSize) {
    await db.batch(statements.slice(i, i + batchSize));
  }
}

function chunkSizeForColumns(columnCount) {
  return Math.max(1, Math.floor(MAXIMUM_QUERY_VARS / columnCount));
}

function buildInsertStatements(db, table, columns, rows, conflictClause = '') {
  if (!rows.length) {
    return [];
  }

  const statements = [];
  const cols = columns.length;
  const size = chunkSizeForColumns(cols);

  for (let offset = 0; offset < rows.length; offset += size) {
    const chunk = rows.slice(offset, offset + size);
    const placeholders = chunk
      .map(() => `(${new Array(cols).fill('?').join(',')})`)
      .join(',');

    const params = [];
    for (const row of chunk) {
      params.push(...row);
    }

    const stmt = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}${conflictClause}`;
    statements.push(prepareStatement(db, stmt, params));
  }

  return statements;
}

function buildInClauseParams(length, singleParam) {
  let stmt = singleParam ? ',(?)' : ',?';

  for (let i = 1; i < length; ) {
    if (i <= length - i) {
      stmt += stmt;
      i *= 2;
    } else {
      stmt += stmt.substring(0, (length - i) * (singleParam ? 4 : 2));
      break;
    }
  }

  return stmt.substring(1);
}

function createResult(rows, resolve, enrich) {
  if (resolve) {
    for (let i = 0; i < rows.length; i++) {
      if (enrich) {
        if (rows[i].doc) {
          rows[i].doc = JSON.parse(rows[i].doc);
        }
      } else {
        rows[i] = rows[i].id;
      }
    }
    return rows;
  }

  const arr = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    arr[row.res] || (arr[row.res] = []);
    arr[row.res].push(enrich ? row : row.id);
  }

  return arr;
}

/**
 * D1-backed FlexSearch adapter compatible with FlexSearch storage interface.
 */
export default class D1Database {
  constructor(name, config = {}) {
    if (typeof name === 'object') {
      config = name;
      name = name.name;
    }

    this.id = name || 'd1';
    this.field = config.field ? '_' + sanitize(config.field) : '';
    this.scope = sanitize(this.id || 'd1');
    this.support_tag_search = true;
    this.db = config.db || null;
    this.type = config.type ? types[config.type.toLowerCase()] : 'text';

    if (!this.type) {
      throw new Error("Unknown type of ID '" + config.type + "'");
    }

    if (!this.db) {
      throw new Error('SqliteDB for D1 requires `config.db` (Cloudflare D1 binding).');
    }
  }

  tableName(ref) {
    if (ref === 'reg') {
      return `reg_${this.scope}`;
    }
    return `${ref}_${this.scope}_${this.field}`;
  }

  indexName(ref, key) {
    if (ref === 'reg') {
      return `reg_${key}_${this.scope}`;
    }
    return `${ref}_${key}_${this.scope}_${this.field}`;
  }

  mount(flexsearch) {
    if (flexsearch.index) {
      return flexsearch.mount(this);
    }

    flexsearch.db = this;
    return this.open();
  }

  async open() {
    if (!this.db) {
      throw new Error('D1 database binding is missing. Pass `config.db` when creating SqliteDB.');
    }

    const mapTable = this.tableName('map');
    const ctxTable = this.tableName('ctx');
    const tagTable = this.tableName('tag');
    const cfgTable = this.tableName('cfg');
    const regTable = this.tableName('reg');

    const schemaStatements = [
      `CREATE TABLE IF NOT EXISTS ${mapTable} (
        key TEXT NOT NULL,
        res INTEGER NOT NULL,
        id  ${this.type} NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS ${this.indexName('map', 'key')} ON ${mapTable} (key)`,
      `CREATE INDEX IF NOT EXISTS ${this.indexName('map', 'id')} ON ${mapTable} (id)`,
      `CREATE TABLE IF NOT EXISTS ${ctxTable} (
        ctx TEXT NOT NULL,
        key TEXT NOT NULL,
        res INTEGER NOT NULL,
        id  ${this.type} NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS ${this.indexName('ctx', 'ctx_key')} ON ${ctxTable} (ctx, key)`,
      `CREATE INDEX IF NOT EXISTS ${this.indexName('ctx', 'id')} ON ${ctxTable} (id)`,
      `CREATE TABLE IF NOT EXISTS ${tagTable} (
        tag TEXT NOT NULL,
        id  ${this.type} NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS ${this.indexName('tag', 'tag')} ON ${tagTable} (tag)`,
      `CREATE INDEX IF NOT EXISTS ${this.indexName('tag', 'id')} ON ${tagTable} (id)`,
      `CREATE TABLE IF NOT EXISTS ${cfgTable} (
        cfg TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS ${regTable} (
        id ${this.type} NOT NULL PRIMARY KEY,
        doc TEXT DEFAULT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS ${this.indexName('reg', 'id')} ON ${regTable} (id)`,
    ];
    
    await execBatches(
      this.db,
      schemaStatements.map((stmt) => prepareStatement(this.db, stmt))
    );

    return this.db;
  }

  close() {
    this.db = null;
    TRX[this.id] = null;
    return this;
  }

  async destroy() {
    await this.db.exec(`
      DROP TABLE IF EXISTS ${this.tableName('map')};
      DROP TABLE IF EXISTS ${this.tableName('ctx')};
      DROP TABLE IF EXISTS ${this.tableName('tag')};
      DROP TABLE IF EXISTS ${this.tableName('cfg')};
      DROP TABLE IF EXISTS ${this.tableName('reg')};
    `);
  }

  async clear() {
    await this.db.exec(`
      DELETE FROM ${this.tableName('map')};
      DELETE FROM ${this.tableName('ctx')};
      DELETE FROM ${this.tableName('tag')};
      DELETE FROM ${this.tableName('cfg')};
      DELETE FROM ${this.tableName('reg')};
    `);
  }

  async get(key, ctx, limit = 0, offset = 0, resolve = true, enrich = false, tags) {
    let stmt = '';
    const params = ctx ? [ctx, key] : [key];
    const table = ctx ? this.tableName('ctx') : this.tableName('map');
    const regTable = this.tableName('reg');
    const tagTable = this.tableName('tag');

    if (tags) {
      for (let i = 0; i < tags.length; i += 2) {
        stmt += ` AND ${table}.id IN (SELECT id FROM ${tagTable} WHERE tag = ?)`;
        params.push(tags[i + 1]);
      }
    }

    const rows = await queryAll(
      this.db,
      `
        SELECT ${table}.id
               ${resolve ? '' : ', res'}
               ${enrich ? ', doc' : ''}
        FROM ${table}
        ${enrich ? `LEFT JOIN ${regTable} ON ${regTable}.id = ${table}.id` : ''}
        WHERE ${ctx ? 'ctx = ? AND key = ?' : 'key = ?'} ${stmt}
        ORDER BY res
        ${limit ? 'LIMIT ' + limit : ''}
        ${offset ? 'OFFSET ' + offset : ''}
      `,
      params
    );

    return createResult(rows, resolve, enrich);
  }

  async tag(tag, limit = 0, offset = 0, enrich = false) {
    const table = this.tableName('tag');
    const regTable = this.tableName('reg');

    const rows = await queryAll(
      this.db,
      `
        SELECT ${table}.id
               ${enrich ? ', doc' : ''}
        FROM ${table}
        ${enrich ? `LEFT JOIN ${regTable} ON ${regTable}.id = ${table}.id` : ''}
        WHERE tag = ?
        ${limit ? 'LIMIT ' + limit : ''}
        ${offset ? 'OFFSET ' + offset : ''}
      `,
      [tag]
    );

    return enrich ? rows : createResult(rows, true, false);
  }

  async enrich(ids) {
    const result = [];
    const promises = [];
    const regTable = this.tableName('reg');

    if (typeof ids !== 'object') {
      ids = [ids];
    }

    for (let count = 0; count < ids.length; ) {
      const chunk =
        ids.length - count > MAXIMUM_QUERY_VARS
          ? ids.slice(count, count + MAXIMUM_QUERY_VARS)
          : count
            ? ids.slice(count)
            : ids;

      const stmt = buildInClauseParams(chunk.length);
      count += chunk.length;

      promises.push(queryAll(this.db, `SELECT id, doc FROM ${regTable} WHERE id IN (${stmt})`, chunk));
    }

    const batches = await Promise.all(promises);

    for (const batch of batches) {
      if (batch && batch.length) {
        for (let i = 0; i < batch.length; i++) {
          if (batch[i].doc) {
            batch[i].doc = JSON.parse(batch[i].doc);
          }
        }
        result.push(batch);
      }
    }

    return result.length === 1 ? result[0] : result.length > 1 ? concat(result) : result;
  }

  async has(id) {
    const result = await queryFirst(
      this.db,
      `SELECT EXISTS(SELECT 1 FROM ${this.tableName('reg')} WHERE id = ?) AS exist`,
      [id]
    );

    return !!(result && result.exist);
  }

  async search(
    flexsearch,
    query,
    limit = 100,
    offset = 0,
    suggest = false,
    resolve = true,
    enrich = false,
    tags
  ) {
    if (!Array.isArray(query) || query.length === 0) {
      return [];
    }

    let rows;
    const tagTable = this.tableName('tag');
    const regTable = this.tableName('reg');

    if (query.length > 1 && flexsearch.depth) {
      let stmt = '';
      const params = [];
      let keyword = query[0];

      for (let i = 1; i < query.length; i++) {
        const term = query[i];
        const swap = flexsearch.bidirectional && term > keyword;
        stmt += (stmt ? ' OR ' : '') + '(ctx = ? AND key = ?)';
        params.push(swap ? term : keyword, swap ? keyword : term);
        keyword = term;
      }

      if (tags) {
        stmt = '(' + stmt + ')';
        for (let i = 0; i < tags.length; i += 2) {
          stmt += ` AND id IN (SELECT id FROM ${tagTable} WHERE tag = ?)`;
          params.push(tags[i + 1]);
        }
      }

      rows = await queryAll(
        this.db,
        `
          SELECT r.id
                 ${resolve ? '' : ', res'}
                 ${enrich ? ', doc' : ''}
          FROM (
            SELECT id,
                   count(*) as count,
                   ${suggest ? 'SUM' : 'SUM'}(res) as res
            FROM ${this.tableName('ctx')}
            WHERE ${stmt}
            GROUP BY id
          ) as r
          ${enrich ? `LEFT JOIN ${regTable} ON ${regTable}.id = r.id` : ''}
          ${suggest ? '' : 'WHERE count = ' + (query.length - 1)}
          ORDER BY ${suggest ? 'count DESC, res' : 'res'}
          ${limit ? 'LIMIT ' + limit : ''}
          ${offset ? 'OFFSET ' + offset : ''}
        `,
        params
      );
    } else {
      let stmt = '';
      const queryLength = query.length;

      for (let i = 0; i < queryLength; i++) {
        stmt += (stmt ? ' OR ' : '') + 'key = ?';
      }

      if (tags) {
        stmt = '(' + stmt + ')';
        for (let i = 0; i < tags.length; i += 2) {
          stmt += ` AND id IN (SELECT id FROM ${tagTable} WHERE tag = ?)`;
          query.push(tags[i + 1]);
        }
      }

      rows = await queryAll(
        this.db,
        `
          SELECT r.id
                 ${resolve ? '' : ', res'}
                 ${enrich ? ', doc' : ''}
          FROM (
            SELECT id,
                   count(*) as count,
                   ${suggest ? 'SUM' : 'SUM'}(res) as res
            FROM ${this.tableName('map')}
            WHERE ${stmt}
            GROUP BY id
          ) as r
          ${enrich ? `LEFT JOIN ${regTable} ON ${regTable}.id = r.id` : ''}
          ${suggest ? '' : 'WHERE count = ' + queryLength}
          ORDER BY ${suggest ? 'count DESC, res' : 'res'}
          ${limit ? 'LIMIT ' + limit : ''}
          ${offset ? 'OFFSET ' + offset : ''}
        `,
        query
      );
    }

    return createResult(rows, resolve, enrich);
  }

  info() {
    // todo
  }

  async transaction(task, callback) {
    if (TRX[this.id]) {
      await TRX[this.id];
    }

    const run = (async () => {
      const result = await task.call(this);
      if (callback) {
        callback(result);
      }
      return result;
    })();

    TRX[this.id] = run.finally(() => {
      TRX[this.id] = null;
    });

    return TRX[this.id];
  }

  async commit(flexsearch) {
    const tasks = flexsearch.commit_task;
    const removals = [];
    const inserts = [];
    flexsearch.commit_task = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (typeof task.del !== 'undefined') {
        removals.push(task.del);
      } else if (typeof task.ins !== 'undefined') {
        inserts.push(task.ins);
      }
    }

    if (removals.length) {
      await this.remove(removals);
    }

    if (!flexsearch.reg.size) {
      return;
    }

    const statements = [];
    const mapTable = this.tableName('map');
    const ctxTable = this.tableName('ctx');
    const regTable = this.tableName('reg');
    const tagTable = this.tableName('tag');

    const mapRows = [];
    for (const item of flexsearch.map) {
      const key = item[0];
      const arr = item[1];

      for (let i = 0; i < arr.length; i++) {
        const ids = arr[i];
        if (!ids || !ids.length) continue;

        for (let j = 0; j < ids.length; j++) {
          mapRows.push([key, i, ids[j]]);
        }
      }
    }
    statements.push(...buildInsertStatements(this.db, mapTable, ['key', 'res', 'id'], mapRows));

    const ctxRows = [];
    for (const ctx of flexsearch.ctx) {
      const ctxKey = ctx[0];
      const ctxValue = ctx[1];

      for (const item of ctxValue) {
        const key = item[0];
        const arr = item[1];

        for (let i = 0; i < arr.length; i++) {
          const ids = arr[i];
          if (!ids || !ids.length) continue;

          for (let j = 0; j < ids.length; j++) {
            ctxRows.push([ctxKey, key, i, ids[j]]);
          }
        }
      }
    }
    statements.push(...buildInsertStatements(this.db, ctxTable, ['ctx', 'key', 'res', 'id'], ctxRows));

    if (flexsearch.store) {
      const regRows = [];

      for (const item of flexsearch.store.entries()) {
        const id = item[0];
        const doc = item[1];
        regRows.push([id, typeof doc === 'object' ? JSON.stringify(doc) : doc || null]);
      }

      statements.push(
        ...buildInsertStatements(
          this.db,
          regTable,
          ['id', 'doc'],
          regRows,
          ' ON CONFLICT(id) DO NOTHING'
        )
      );
    } else if (!flexsearch.bypass) {
      const ids = toArray(flexsearch.reg);
      const regRows = ids.map((id) => [id]);

      statements.push(
        ...buildInsertStatements(this.db, regTable, ['id'], regRows, ' ON CONFLICT(id) DO NOTHING')
      );
    }

    if (flexsearch.tag) {
      const tagRows = [];

      for (const item of flexsearch.tag) {
        const tag = item[0];
        const ids = item[1];
        if (!ids.length) continue;

        for (let i = 0; i < ids.length; i++) {
          tagRows.push([tag, ids[i]]);
        }
      }

      statements.push(...buildInsertStatements(this.db, tagTable, ['tag', 'id'], tagRows));
    }

    if (statements.length) {
      await execBatches(this.db, statements);
    }

    if (inserts.length) {
      await this.cleanup();
    }

    flexsearch.map.clear();
    flexsearch.ctx.clear();
    flexsearch.tag && flexsearch.tag.clear();
    flexsearch.store && flexsearch.store.clear();
    flexsearch.document || flexsearch.reg.clear();
  }

  async remove(ids) {
    if (typeof ids !== 'object') {
      ids = [ids];
    }

    for (let offset = 0; offset < ids.length; offset += MAXIMUM_QUERY_VARS) {
      const chunk = ids.slice(offset, offset + MAXIMUM_QUERY_VARS);
      const stmt = buildInClauseParams(chunk.length);

      const statements = [
        prepareStatement(this.db, `DELETE FROM ${this.tableName('map')} WHERE id IN (${stmt})`, chunk),
        prepareStatement(this.db, `DELETE FROM ${this.tableName('ctx')} WHERE id IN (${stmt})`, chunk),
        prepareStatement(this.db, `DELETE FROM ${this.tableName('tag')} WHERE id IN (${stmt})`, chunk),
        prepareStatement(this.db, `DELETE FROM ${this.tableName('reg')} WHERE id IN (${stmt})`, chunk),
      ];

      await this.db.batch(statements);
    }
  }

  async cleanup() {
    const mapTable = this.tableName('map');
    const ctxTable = this.tableName('ctx');

    await this.db.batch([
      prepareStatement(
        this.db,
        `
          DELETE FROM ${mapTable}
          WHERE rowid IN (
            SELECT rowid FROM (
              SELECT rowid, row_number() OVER dupes AS count
              FROM ${mapTable} _t
              WINDOW dupes AS (PARTITION BY id, key ORDER BY res)
            )
            WHERE count > 1
          )
        `
      ),
      prepareStatement(
        this.db,
        `
          DELETE FROM ${ctxTable}
          WHERE rowid IN (
            SELECT rowid FROM (
              SELECT rowid, row_number() OVER dupes AS count
              FROM ${ctxTable} _t
              WINDOW dupes AS (PARTITION BY id, ctx, key ORDER BY res)
            )
            WHERE count > 1
          )
        `
      ),
    ]);
  }

  async promisfy(opt) {
    const method = opt.method;

    if (method === 'all') {
      return queryAll(this.db, opt.stmt, opt.params || []);
    }

    if (method === 'get') {
      return queryFirst(this.db, opt.stmt, opt.params || []);
    }

    if (method === 'run') {
      return runStatement(this.db, opt.stmt, opt.params || []);
    }

    throw new Error(`Unsupported method in promisfy: ${method}`);
  }
}
