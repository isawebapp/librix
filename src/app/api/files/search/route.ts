import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const rows = db
      .prepare(
        `SELECT id, backendId, path, name, size, modifiedAt, scannedAt
         FROM files
         WHERE name LIKE ? AND isDirectory = 0
         ORDER BY name
         LIMIT 200`
      )
      .all(`%${q}%`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error searching files:', error);
    return NextResponse.json(
      { error: 'Failed to search files' },
      { status: 500 }
    );
  }
}
