// src/app/api/backends/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import db from '@/utils/db';
import { authOptions } from '@/lib/auth';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string };
  if (!session || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function getNextId() {
  const rows = db
    .prepare('SELECT id FROM backends ORDER BY id')
    .all() as { id: number }[];

  let next = 1;
  for (const row of rows) {
    if (row.id === next) next++;
    else break;
  }
  return next;
}

export async function GET() {
  try {
    const list = db
      .prepare('SELECT id, name, rescanInterval FROM backends ORDER BY id')
      .all() as { id: number; name: string; rescanInterval: number | null }[];
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching backends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backends' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authErr = await requireAdmin();
    if (authErr) return authErr;

    const { name, url, authEnabled, username, password, rescanInterval } =
      await req.json();
    const id = getNextId();
    const label = name?.trim() || url;

    db.prepare(`
      INSERT INTO backends
        (id, name, url, authEnabled, username, password, rescanInterval)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      label,
      url,
      authEnabled ? 1 : 0,
      username || null,
      password || null,
      rescanInterval ?? null
    );

    const created = db
      .prepare('SELECT * FROM backends WHERE id = ?')
      .get(id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating backend:', error);
    return NextResponse.json(
      { error: 'Failed to create backend' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authErr = await requireAdmin();
    if (authErr) return authErr;

    const { id, name, url, authEnabled, username, password, rescanInterval } =
      await req.json();
    const label = name?.trim() || url;

    db.prepare(`
      UPDATE backends
         SET name = ?, url = ?, authEnabled = ?, username = ?, password = ?, rescanInterval = ?
       WHERE id = ?
    `).run(
      label,
      url,
      authEnabled ? 1 : 0,
      username || null,
      password || null,
      rescanInterval ?? null,
      id
    );

    const updated = db
      .prepare('SELECT * FROM backends WHERE id = ?')
      .get(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating backend:', error);
    return NextResponse.json(
      { error: 'Failed to update backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authErr = await requireAdmin();
    if (authErr) return authErr;

    const { id } = await req.json();
    const delId = Number(id);

    db.prepare('DELETE FROM backends WHERE id = ?').run(delId);

    const higher = db
      .prepare('SELECT id FROM backends WHERE id > ? ORDER BY id ASC')
      .all() as { id: number }[];

    const shift = db.transaction((rows: { id: number }[]) => {
      for (const { id: oldId } of rows) {
        const newId = oldId - 1;
        db.prepare('UPDATE files SET backendId = ? WHERE backendId = ?')
          .run(newId, oldId);
        db.prepare('UPDATE backends SET id = ? WHERE id = ?')
          .run(newId, oldId);
      }
    });
    shift(higher);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting backend:', error);
    return NextResponse.json(
      { error: 'Failed to delete backend' },
      { status: 500 }
    );
  }
}
