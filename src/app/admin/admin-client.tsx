// src/app/admin/admin-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

type Backend = {
  id: number;
  name: string;
  url: string;
  authEnabled: boolean;
  username?: string;
  password?: string;
  rescanInterval?: number | null;
};

export default function AdminClient() {
  const [backends, setBackends] = useState<Backend[]>([]);
  const [form, setForm] = useState<Partial<Backend>>({
    authEnabled: false,
    rescanInterval: null,
  });

  useEffect(() => {
    (async () => {
      setBackends(await fetch('/api/backends').then((r) => r.json()));
    })();
  }, []);

  async function save() {
    const method = form.id ? 'PUT' : 'POST';
    const res = await fetch('/api/backends', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const saved: Backend = await res.json();

    await fetch('/api/backends/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: saved.id }),
    });

    setBackends(await fetch('/api/backends').then((r) => r.json()));
    setForm({ authEnabled: false, rescanInterval: null });
  }

  async function rescan(id: number) {
    await fetch('/api/backends/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    alert('Rescan triggered');
  }

  async function deleteBackend(id: number) {
    if (!confirm(`Delete backend #${id}?`)) return;
    await fetch('/api/backends', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setBackends(await fetch('/api/backends').then((r) => r.json()));
  }

  function edit(b: Backend) {
    setForm({
      id: b.id,
      name: b.name,
      url: b.url,
      authEnabled: b.authEnabled,
      username: b.username,
      password: b.password,
      rescanInterval: b.rescanInterval ?? null,
    });
  }

  function cancel() {
    setForm({ authEnabled: false, rescanInterval: null });
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Panel</h1>
        <button onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: '0.5rem 1rem' }}>
          Logout
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {backends.map((b) => (
          <li key={b.id} style={{ marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '2ch',
                fontWeight: 'bold',
                textAlign: 'right',
                marginRight: '0.5rem',
              }}
            >
              {b.id}
            </span>
            <strong>{b.name}</strong>{' '}
            <button onClick={() => edit(b)}>Edit</button>{' '}
            <button onClick={() => rescan(b.id)}>Rescan</button>{' '}
            <button onClick={() => deleteBackend(b.id)}>Delete</button>{' '}
            <em>
              Auto-rescan:{' '}
              {b.rescanInterval == null
                ? 'never'
                : `every ${b.rescanInterval} minute${b.rescanInterval > 1 ? 's' : ''}`}
            </em>
          </li>
        ))}
      </ul>

      <h2>{form.id ? 'Edit' : 'Add'} Backend</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Name:{' '}
          <input
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          URL:{' '}
          <input
            value={form.url || ''}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Auth?{' '}
          <input
            type="checkbox"
            checked={form.authEnabled || false}
            onChange={(e) => setForm({ ...form, authEnabled: e.target.checked })}
          />
        </label>

        {form.authEnabled && (
          <>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Username:{' '}
              <input
                value={form.username || ''}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Password:{' '}
              <input
                type="password"
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
          </>
        )}

        <fieldset style={{ marginBottom: '0.5rem' }}>
          <legend>Auto-rescan</legend>
          <label style={{ marginRight: '1rem' }}>
            <input
              type="radio"
              name="rescanOption"
              checked={form.rescanInterval == null}
              onChange={() => setForm({ ...form, rescanInterval: null })}
            />{' '}
            Never
          </label>
          <label>
            <input
              type="radio"
              name="rescanOption"
              checked={form.rescanInterval != null}
              onChange={() => setForm({ ...form, rescanInterval: form.rescanInterval ?? 5 })}
            />{' '}
            Every{' '}
            <input
              type="number"
              disabled={form.rescanInterval == null}
              value={form.rescanInterval ?? ''}
              onChange={(e) => setForm({ ...form, rescanInterval: Number(e.target.value) })}
              style={{ width: '4ch', marginLeft: '0.25rem' }}
            />{' '}
            minutes
          </label>
        </fieldset>

        <button onClick={save} style={{ marginRight: '0.5rem' }}>
          {form.id ? 'Update' : 'Add'} Backend
        </button>
        {form.id && <button onClick={cancel}>Cancel</button>}
      </div>
    </>
  );
}
