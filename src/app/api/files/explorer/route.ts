// src/app/api/files/explorer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

// List only the *direct* children of the given path, and return `name` as the base filename/dirname
export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Validate and parse backendId
  const backendIdParam = url.searchParams.get('backendId');
  const backendId = Number(backendIdParam);
  if (!backendIdParam || Number.isNaN(backendId)) {
    return NextResponse.json(
      { error: 'Invalid or missing backendId' },
      { status: 400 }
    );
  }

  // 2. Get and normalize the requested directory path
  const dirPathParam = url.searchParams.get('path') || '/';
  let parent = dirPathParam;
  if (!parent.startsWith('/')) parent = '/' + parent;
  if (!parent.endsWith('/')) parent = parent + '/';

  // 3. Use a parameterized query to prevent SQL injection
  const stmt = db.prepare(`
    SELECT id, path, isDirectory
      FROM files
     WHERE backendId = ?
       AND path LIKE ?
    ORDER BY isDirectory DESC, name
  `);
  const allRows = stmt.all(backendId, `${parent}%`) as {
    id: number;
    path: string;
    isDirectory: number;
  }[];

  // 4. Filter down to *direct* children only
  const direct = allRows.filter((row) => {
    // Strip off the parent prefix, then remove any leading slashes
    const remainder = row.path.slice(parent.length).replace(/^\/+/, '');
    if (!remainder) return false;
    const parts = remainder.split('/');
    // Either a single segment ("foo") or a segment plus trailing slash ("foo/")
    return parts.length === 1 || (parts.length === 2 && parts[1] === '');
  });

  // 5. Compute `name` from the path and map to the API shape
  const entries = direct.map((row) => {
    const isDir = row.isDirectory === 1;
    let name = row.path.slice(parent.length);
    if (isDir && name.endsWith('/')) name = name.slice(0, -1);
    return {
      id: row.id,
      path: row.path,
      name,
      isDirectory: isDir,
    };
  });

  // 6. Return JSON response
  return NextResponse.json(entries);
}
