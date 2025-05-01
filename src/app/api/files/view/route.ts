import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const backendId = Number(url.searchParams.get('backendId'));
  const filePath  = url.searchParams.get('path') || '';

  const backend = db
    .prepare('SELECT * FROM backends WHERE id = ?')
    .get(backendId);
  if (!backend) {
    return new NextResponse('Unknown backend', { status: 404 });
  }

  const file = db
    .prepare('SELECT url FROM files WHERE backendId = ? AND path = ?')
    .get(backendId, filePath);
  if (!file) {
    return new NextResponse('File not found', { status: 404 });
  }

  const forwardHeaders: Record<string, string> = {};
  const range = request.headers.get('range');
  if (range) {
    forwardHeaders['range'] = range;
  }
  if (backend.authEnabled) {
    const creds = Buffer.from(
      `${backend.username}:${backend.password}`
    ).toString('base64');
    forwardHeaders['authorization'] = `Basic ${creds}`;
  }

  const upstream = await fetch(file.url, { headers: forwardHeaders });
  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(`Upstream error: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  const responseHeaders = new Headers();
  for (const header of [
    'content-type',
    'accept-ranges',
    'content-range',
    'content-length',
    'cache-control',
    'etag',
  ]) {
    const value = upstream.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }
  responseHeaders.set(
    'content-disposition',
    `inline; filename="${filePath.split('/').pop()}"`
  );

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
