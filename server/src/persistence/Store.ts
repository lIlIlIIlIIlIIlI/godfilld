import { DatabaseSync } from 'node:sqlite';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import type { RoomRecord } from '../rooms/RoomService.js';
export interface Identity {
  id: string;
  tokenHash: string;
  name: string;
}
export interface Store {
  init(): Promise<void>;
  list(): Promise<RoomRecord[]>;
  get(id: string): Promise<RoomRecord | null>;
  create(room: RoomRecord): Promise<void>;
  mutate(id: string, fn: (r: RoomRecord) => void): Promise<RoomRecord>;
  identity(id: string): Promise<Identity | null>;
  saveIdentity(i: Identity): Promise<void>;
  close(): Promise<void>;
}
export class SQLiteStore implements Store {
  db: DatabaseSync;
  constructor(path = process.env.SQLITE_PATH ?? 'arena.sqlite') {
    this.db = new DatabaseSync(path);
  }
  async init() {
    this.db.exec(
      'PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS rooms(id TEXT PRIMARY KEY,data TEXT NOT NULL);CREATE TABLE IF NOT EXISTS identities(id TEXT PRIMARY KEY,data TEXT NOT NULL)',
    );
  }
  async list() {
    return (this.db.prepare('SELECT data FROM rooms').all() as { data: string }[]).map(
      (r) => JSON.parse(r.data) as RoomRecord,
    );
  }
  async get(id: string) {
    const r = this.db.prepare('SELECT data FROM rooms WHERE id=?').get(id) as
      { data: string } | undefined;
    return r ? (JSON.parse(r.data) as RoomRecord) : null;
  }
  async create(room: RoomRecord) {
    this.db.prepare('INSERT INTO rooms(id,data) VALUES(?,?)').run(room.id, JSON.stringify(room));
  }
  async mutate(id: string, fn: (r: RoomRecord) => void) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const row = this.db.prepare('SELECT data FROM rooms WHERE id=?').get(id) as
        { data: string } | undefined;
      if (!row) throw new Error('방을 찾을 수 없습니다.');
      const r: RoomRecord = JSON.parse(row.data);
      fn(r);
      r.revision++;
      this.db.prepare('UPDATE rooms SET data=? WHERE id=?').run(JSON.stringify(r), id);
      this.db.exec('COMMIT');
      return r;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }
  async identity(id: string) {
    const r = this.db.prepare('SELECT data FROM identities WHERE id=?').get(id) as
      { data: string } | undefined;
    return r ? (JSON.parse(r.data) as Identity) : null;
  }
  async saveIdentity(i: Identity) {
    this.db.prepare('INSERT INTO identities(id,data) VALUES(?,?)').run(i.id, JSON.stringify(i));
  }
  async close() {
    this.db.close();
  }
}
export class PostgresStore implements Store {
  pool: Pool;
  constructor(url: string) {
    this.pool = new Pool({
      connectionString: url,
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 5_000,
    });
    if (process.env.VERCEL) attachDatabasePool(this.pool);
  }
  async init() {
    await this.pool.query(
      'CREATE TABLE IF NOT EXISTS arena_rooms(id TEXT PRIMARY KEY,data JSONB NOT NULL);CREATE TABLE IF NOT EXISTS arena_identities(id TEXT PRIMARY KEY,data JSONB NOT NULL)',
    );
  }
  async list() {
    return (await this.pool.query('SELECT data FROM arena_rooms')).rows.map(
      (r) => r.data as RoomRecord,
    );
  }
  async get(id: string) {
    return (
      (await this.pool.query('SELECT data FROM arena_rooms WHERE id=$1', [id])).rows[0]?.data ??
      null
    );
  }
  async create(r: RoomRecord) {
    await this.pool.query('INSERT INTO arena_rooms(id,data) VALUES($1,$2)', [
      r.id,
      JSON.stringify(r),
    ]);
  }
  async mutate(id: string, fn: (r: RoomRecord) => void) {
    const c = await this.pool.connect();
    try {
      await c.query('BEGIN');
      const row = (await c.query('SELECT data FROM arena_rooms WHERE id=$1 FOR UPDATE', [id]))
        .rows[0];
      if (!row) throw new Error('방을 찾을 수 없습니다.');
      const r = row.data as RoomRecord;
      fn(r);
      r.revision++;
      await c.query('UPDATE arena_rooms SET data=$1 WHERE id=$2', [JSON.stringify(r), id]);
      await c.query('COMMIT');
      return r;
    } catch (e) {
      await c.query('ROLLBACK');
      throw e;
    } finally {
      c.release();
    }
  }
  async identity(id: string) {
    return (
      (await this.pool.query('SELECT data FROM arena_identities WHERE id=$1', [id])).rows[0]
        ?.data ?? null
    );
  }
  async saveIdentity(i: Identity) {
    await this.pool.query('INSERT INTO arena_identities(id,data) VALUES($1,$2)', [
      i.id,
      JSON.stringify(i),
    ]);
  }
  async close() {
    await this.pool.end();
  }
}
export function configuredStore(): Store {
  if (process.env.DATABASE_URL) return new PostgresStore(process.env.DATABASE_URL);
  if (process.env.VERCEL) throw new Error('운영 환경에는 DATABASE_URL(PostgreSQL)이 필요합니다.');
  return new SQLiteStore();
}
