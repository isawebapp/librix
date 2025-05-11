// src/app/api/files/explorer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  const backendIdParam = url.searchParams.get('backendId');
  const backendId = Number(backendIdParam);
  if (!backendIdParam || Number.isNaN(backendId)) {
    return NextResponse.json(
      { error: 'Invalid or missing backendId' },
      { status: 400 }
    );
  }

  const dirPathParam = url.searchParams.get('path') || '/';
  let parent = dirPathParam;
  if (!parent.startsWith('/')) parent = '/' + parent;
  if (!parent.endsWith('/')) parent = parent + '/';

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

  const direct = allRows.filter((row) => {
    const remainder = row.path.slice(parent.length).replace(/^\/+/, '');
    if (!remainder) return false;
    const parts = remainder.split('/');
    return parts.length === 1 || (parts.length === 2 && parts[1] === '');
  });

  const entries = direct.map((row) => {
    const isDir = row.isDirectory === 1;
    let name = row.path.slice(parent.length);
    if (isDir && name.endsWith('/')) name = name.slice(0, -1);
    
    name = decodeURIComponent(name);

    return {
      id: row.id,
      path: row.path,
      name,
      isDirectory: isDir,
    };
  });

  return NextResponse.json(entries);
}
