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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <ul className="list-none p-0 space-y-2">
        {backends.map((b) => (
          <li key={b.id} className="flex items-center">
            <span className="inline-block w-8 font-bold text-right mr-2">{b.id}</span>
            <strong className="mr-4">{b.name}</strong>
            <button onClick={() => edit(b)} className="text-primary-500 hover:underline mr-2">
              Edit
            </button>
            <button onClick={() => rescan(b.id)} className="text-primary-500 hover:underline mr-2">
              Rescan
            </button>
            <button onClick={() => deleteBackend(b.id)} className="text-red-500 hover:underline mr-2">
              Delete
            </button>
            <em className="text-sm text-gray-600 dark:text-gray-400">
              Auto-rescan:{' '}
              {b.rescanInterval == null
                ? 'never'
                : `every ${b.rescanInterval} minute${b.rescanInterval > 1 ? 's' : ''}`}
            </em>
          </li>
        ))}
      </ul>

      <div>
        <h2 className="text-xl font-semibold mb-2">{form.id ? 'Edit' : 'Add'} Backend</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="block mb-1">Name:</span>
            <input
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            />
          </label>

          <label className="block">
            <span className="block mb-1">URL:</span>
            <input
              value={form.url || ''}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            />
          </label>

          <label className="block">
            <input
              type="checkbox"
              checked={form.authEnabled || false}
              onChange={(e) => setForm({ ...form, authEnabled: e.target.checked })}
              className="mr-2"
            />
            Auth?
          </label>

          {form.authEnabled && (
            <>
              <label className="block">
                <span className="block mb-1">Username:</span>
                <input
                  value={form.username || ''}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                />
              </label>
              <label className="block">
                <span className="block mb-1">Password:</span>
                <input
                  type="password"
                  value={form.password || ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                />
              </label>
            </>
          )}

          <fieldset className="mb-4">
            <legend className="font-medium">Auto-rescan</legend>
            <div className="flex items-center">
              <label className="mr-4 flex items-center">
                <input
                  type="radio"
                  name="rescanOption"
                  checked={form.rescanInterval == null}
                  onChange={() => setForm({ ...form, rescanInterval: null })}
                  className="mr-2"
                />
                Never
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="rescanOption"
                  checked={form.rescanInterval != null}
                  onChange={() => setForm({ ...form, rescanInterval: form.rescanInterval ?? 5 })}
                  className="mr-2"
                />
                Every
                <input
                  type="number"
                  disabled={form.rescanInterval == null}
                  value={form.rescanInterval ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, rescanInterval: Number(e.target.value) })
                  }
                  className="w-16 ml-2 p-1 border border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-1">minutes</span>
              </label>
            </div>
          </fieldset>

          <div className="flex space-x-4">
            <button
              onClick={save}
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              {form.id ? 'Update' : 'Add'} Backend
            </button>
            {form.id && (
              <button
                onClick={cancel}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
