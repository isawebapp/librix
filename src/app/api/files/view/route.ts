// src/app/api/files/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export const runtime = 'nodejs';

// Define the expected shape of a backend record
interface BackendRecord {
  id: number;
  name: string;
  url: string;
  authEnabled: number;       // 1 = true, 0 = false
  username: string | null;
  password: string | null;
  rescanInterval: number | null;
}

// Define the expected shape of a file record
interface FileRecord {
  url: string;
}

export async function GET(request: NextRequest) {
  const url        = request.nextUrl;
  const backendId  = Number(url.searchParams.get('backendId'));
  const filePath   = url.searchParams.get('path') || '';

  // Lookup backend (cast result to our interface)
  const backend = db
    .prepare('SELECT * FROM backends WHERE id = ?')
    .get(backendId) as BackendRecord | undefined;

  if (!backend) {
    return new NextResponse('Unknown backend', { status: 404 });
  }

  // Lookup file URL
  const file = db
    .prepare('SELECT url FROM files WHERE backendId = ? AND path = ?')
    .get(backendId, filePath) as FileRecord | undefined;

  if (!file) {
    return new NextResponse('File not found', { status: 404 });
  }

  // Prepare headers to forward (Range + auth)
  const forwardHeaders: Record<string, string> = {};
  const range = request.headers.get('range');
  if (range) {
    forwardHeaders['range'] = range;
  }
  if (backend.authEnabled === 1) {
    const creds = Buffer.from(
      `${backend.username}:${backend.password}`
    ).toString('base64');
    forwardHeaders['authorization'] = `Basic ${creds}`;
  }

  // Fetch from origin (supports partial content)
  const upstream = await fetch(file.url, { headers: forwardHeaders });
  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(`Upstream error: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  // Copy relevant response headers
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

  // Force inline display
  responseHeaders.set(
    'content-disposition',
    `inline; filename="${filePath.split('/').pop()}"`
  );

  // Stream the body back to client
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
