// src/utils/scanner.ts
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import db from './db';
import { posix as pathPosix } from 'path';

export interface BackendRecord {
  id: number;
  url: string;
  authEnabled: number;
  username?: string;
  password?: string;
  rescanInterval?: number;
  scannedAt?: string;
}

export async function scanBackendById(id: number) {
  const backend: BackendRecord = db
    .prepare('SELECT * FROM backends WHERE id = ?')
    .get(id);
  if (!backend) throw new Error('Backend not found');

  const authHeader = backend.authEnabled
    ? 'Basic ' +
      Buffer.from(`${backend.username}:${backend.password}`).toString('base64')
    : undefined;

  async function recurse(dirPath: string) {
    // ensure trailing slash
    if (!dirPath.endsWith('/')) dirPath += '/';

    const listUrl = backend.url.replace(/\/$/, '') + dirPath;
    const res = await fetch(
      listUrl,
      authHeader ? { headers: { Authorization: authHeader } } : {}
    );
    const html = await res.text();
    const $ = cheerio.load(html);

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      // skip Parent Directory and Apache sort/query links
      if (href.startsWith('..') || href.startsWith('?')) {
        return;
      }

      const isDir = href.endsWith('/');
      const name = href.replace(/\/$/, '');

      // resolve href against the listing URL
      const urlObj = new URL(href, listUrl);

      // build a clean absolute path, collapsing duplicate slashes
      let filePath = pathPosix.normalize(urlObj.pathname);
      if (!filePath.startsWith('/')) filePath = '/' + filePath;
      if (isDir && !filePath.endsWith('/')) filePath += '/';

      // upsert into SQLite
      db.prepare(`
        INSERT INTO files 
          (backendId, path, name, url, isDirectory, scannedAt)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(backendId, path)
        DO UPDATE SET scannedAt = excluded.scannedAt
      `).run(
        backend.id,
        filePath,
        name,
        urlObj.toString(),
        isDir ? 1 : 0,
        new Date().toISOString()
      );
    });

    // now recurse into sub‐dirs
    const dirs: string[] = db
      .prepare(`
        SELECT path FROM files 
         WHERE backendId = ? AND path LIKE ? AND isDirectory = 1
      `)
      .all(backend.id, pathPosix.normalize(dirPath) + '%')
      .map((row: any) => row.path)
      // only direct children:
      .filter(p => {
        const rest = p.slice(dirPath.length).replace(/\/$/, '');
        return rest && !rest.includes('/');
      });

    for (const sub of dirs) {
      await recurse(sub);
    }
  }

  // start at root
  await recurse('/');
  // mark last‐scanned
  db.prepare('UPDATE backends SET scannedAt = ? WHERE id = ?').run(
    new Date().toISOString(),
    id
  );
}
