// src/utils/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.resolve(process.cwd(), 'data.db'));
db.pragma('journal_mode = WAL');

// backends table now has `name`
db.prepare(`
  CREATE TABLE IF NOT EXISTS backends (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    url            TEXT    NOT NULL,
    authEnabled    INTEGER NOT NULL DEFAULT 0,
    username       TEXT,
    password       TEXT,
    rescanInterval INTEGER,
    scannedAt      TEXT
  );
`).run();

// files table unchanged
db.prepare(`
  CREATE TABLE IF NOT EXISTS files (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    backendId   INTEGER NOT NULL,
    path        TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    isDirectory INTEGER NOT NULL,
    size        INTEGER,
    modifiedAt  TEXT,
    scannedAt   TEXT    NOT NULL,
    UNIQUE(backendId, path),
    FOREIGN KEY (backendId) REFERENCES backends(id) ON DELETE CASCADE
  );
`).run();

export default db;
