// src/app/api/files/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export const runtime = 'nodejs';

interface BackendRecord {
  id: number;
  name: string;
  url: string;
  authEnabled: number;       // 1 = true, 0 = false
  username: string | null;
  password: string | null;
  rescanInterval: number | null;
}

interface FileRecord {
  url: string;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Validate and parse backendId
  const backendIdParam = url.searchParams.get('backendId');
  if (!backendIdParam) {
    return new NextResponse('Missing backendId', { status: 400 });
  }
  const backendId = Number(backendIdParam);
  if (Number.isNaN(backendId)) {
    return new NextResponse('Invalid backendId', { status: 400 });
  }

  // 2. Validate and normalize file path
  const filePathParam = url.searchParams.get('path');
  if (!filePathParam) {
    return new NextResponse('Missing file path', { status: 400 });
  }
  let filePath = filePathParam;
  if (!filePath.startsWith('/')) {
    filePath = '/' + filePath;
  }

  // 3. Lookup backend (parameterized)
  const backendStmt = db.prepare(`
    SELECT id, name, url, authEnabled, username, password, rescanInterval
      FROM backends
     WHERE id = ?
  `);
  const backend = backendStmt.get(backendId) as BackendRecord | undefined;
  if (!backend) {
    return new NextResponse('Unknown backend', { status: 404 });
  }

  // 4. Lookup file URL (parameterized)
  const fileStmt = db.prepare(`
    SELECT url
      FROM files
     WHERE backendId = ?
       AND path = ?
  `);
  const file = fileStmt.get(backendId, filePath) as FileRecord | undefined;
  if (!file) {
    return new NextResponse('File not found', { status: 404 });
  }

  // 5. Prepare headers to forward (Range + Basic auth)
  const forwardHeaders: Record<string, string> = {};
  const range = request.headers.get('range');
  if (range) forwardHeaders['range'] = range;

  if (backend.authEnabled === 1 && backend.username && backend.password) {
    const creds = Buffer.from(
      `${backend.username}:${backend.password}`
    ).toString('base64');
    forwardHeaders['authorization'] = `Basic ${creds}`;
  }

  // 6. Fetch from origin (supports partial content)
  const upstream = await fetch(file.url, { headers: forwardHeaders });
  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(`Upstream error: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  // 7. Copy relevant response headers
  const responseHeaders = new Headers();
  for (const header of [
    'content-type',
    'accept-ranges',
    'content-range',
    'content-length',
    'cache-control',
    'etag',
  ] as const) {
    const value = upstream.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }

  // 8. Force inline display with sanitized filename
  const filename = encodeURIComponent(filePath.split('/').pop() || 'file');
  responseHeaders.set(
    'content-disposition',
    `inline; filename="${filename}"`
  );

  // 9. Stream the body back to the client
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
