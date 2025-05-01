import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export function GET(req: NextRequest) {
  const backendId = Number(req.nextUrl.searchParams.get('backendId'));
  let path = req.nextUrl.searchParams.get('path') || '/';
  if (!path.endsWith('/')) path += '/';

  const candidates = db
    .prepare('SELECT * FROM files WHERE backendId = ? AND path LIKE ?')
    .all(backendId, `${path}%`);

  const directChildren = candidates.filter((file) => {
    if (file.path === path) return false;
    const rest = file.path.slice(path.length);
    const parts = rest.split('/').filter(Boolean);
    return parts.length === 1;
  });

  directChildren.sort(
    (a, b) => b.isDirectory - a.isDirectory || a.name.localeCompare(b.name)
  );

  return NextResponse.json(directChildren);
}
