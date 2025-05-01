import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const rows = db
    .prepare(
      `SELECT * FROM files
       WHERE name LIKE ? AND isDirectory = 0
       ORDER BY name
       LIMIT 200`
    )
    .all(`%${q}%`);
  return NextResponse.json(rows);
}
