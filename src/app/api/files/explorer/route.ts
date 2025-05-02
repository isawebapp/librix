// src/app/api/files/explorer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

// List only the *direct* children of the given path, and return `name` as the base filename/dirname
export async function GET(request: NextRequest) {
  const url       = request.nextUrl;
  const backendId = Number(url.searchParams.get('backendId'));
  const dirPath   = url.searchParams.get('path') || '/';

  // Normalize dirPath to always end with '/'
  const parent = dirPath.endsWith('/') ? dirPath : dirPath + '/';

  // Fetch all entries under this backend whose path starts with parent
  const allRows: { id: number; path: string; isDirectory: number }[] =
    db.prepare(`
      SELECT id, path, isDirectory
      FROM files
      WHERE backendId = ?
        AND path LIKE ?
      ORDER BY isDirectory DESC, name
    `).all(backendId, parent + '%');

  // Filter down to direct children only
  const direct = allRows.filter((row) => {
    const remainder = row.path.slice(parent.length).replace(/^\/+/, '');
    // must be non-empty and not contain further '/' beyond the trailing slash for dirs
    if (!remainder) return false;
    const parts = remainder.split('/');
    return parts.length === 1 || (parts.length === 2 && parts[1] === '');
  });

  // Map to API shape, computing `name` from the path
  const entries = direct.map((row) => {
    const isDir = row.isDirectory === 1;
    // strip the parent prefix and any trailing slash
    let name = row.path.slice(parent.length);
    if (isDir && name.endsWith('/')) name = name.slice(0, -1);
    return {
      id: row.id,
      path: row.path,
      name,
      isDirectory: isDir,
    };
  });

  return NextResponse.json(entries);
}
