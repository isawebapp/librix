import { NextRequest, NextResponse } from 'next/server';
import { scanBackendById } from '@/utils/scanner';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  await scanBackendById(id);
  return NextResponse.json({ success: true });
}
