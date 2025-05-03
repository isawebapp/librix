// src/app/explorer/explorer-client.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Entry = {
  id: number;
  name: string;
  path: string;
  isDirectory: boolean;
};

export default function ExplorerClient() {
  const router = useRouter();
  const params = useSearchParams();
  const backendIdParam = params.get('backendId') || '';
  const pathParam = params.get('path') || '/';

  const backendId = backendIdParam ? Number(backendIdParam) : null;
  const [backends, setBackends] = useState<{ id: number; name: string }[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pathInput, setPathInput] = useState('');

  useEffect(() => {
    fetch('/api/backends')
      .then(r => r.json())
      .then(setBackends);
  }, []);

  useEffect(() => {
    if (backendId != null) {
      fetch(
        `/api/files/explorer?backendId=${backendId}&path=${encodeURIComponent(
          pathParam
        )}`
      )
        .then(r => r.json())
        .then(setEntries);
    }
  }, [backendId, pathParam]);

  const updateUrl = (newBackend: number | null, newPath: string) => {
    const url = newBackend
      ? `/explorer?backendId=${newBackend}&path=${encodeURIComponent(newPath)}`
      : '/explorer';
    router.push(url);
    setPathInput('');
  };

  const goUp = () => {
    if (pathParam === '/') return;
    const trimmed = pathParam.endsWith('/') ? pathParam.slice(0, -1) : pathParam;
    const idx = trimmed.lastIndexOf('/');
    const parent = idx > 0 ? trimmed.slice(0, idx + 1) : '/';
    updateUrl(backendId, parent);
  };

  const onGo = () => {
    if (backendId == null || !pathInput.trim()) return;
    let p = pathInput.startsWith('/') ? pathInput : '/' + pathInput;
    if (!p.endsWith('/')) {
      // always treat Go as folder navigation
      p += '/';
    }
    updateUrl(backendId, p);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Backends</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {backends.map(b => (
            <li key={b.id} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => updateUrl(b.id, '/')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem',
                  background: b.id === backendId ? '#e5e7eb' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {b.id}: {b.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <section style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <h1>Explorer</h1>

        {backendId != null ? (
          <>
            {/* Path input and Go button */}
            <div style={{ margin: '1em 0', display: 'flex', alignItems: 'center' }}>
              <input
                placeholder="Enter folder..."
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
                value={pathInput}
                onChange={e => setPathInput(e.target.value)}
              />
              <button onClick={onGo} style={{ marginLeft: '0.5rem' }}>
                Go
              </button>
            </div>

            {/* Up button and current directory */}
            <div style={{ margin: '1em 0', display: 'flex', alignItems: 'center' }}>
              <button onClick={goUp} disabled={pathParam === '/'}>
                ↑ Up
              </button>
              <span style={{ fontFamily: 'monospace', marginLeft: '1rem' }}>
                {pathParam}
              </span>
            </div>

            {/* File & Folder List */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {entries.map(e => (
                <li key={e.id} style={{ marginBottom: '0.5rem' }}>
                  {e.isDirectory ? '📁' : '📄'}{' '}
                  {e.isDirectory ? (
                    <button
                      onClick={() => {
                        const dir = e.path.endsWith('/') ? e.path : e.path + '/';
                        updateUrl(backendId, dir);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#3b82f6',
                        cursor: 'pointer',
                      }}
                    >
                      {e.name}
                    </button>
                  ) : (
                    <Link
                      href={`/viewer?backendId=${backendId}&path=${encodeURIComponent(
                        e.path
                      )}`}
                    >
                      {e.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Please select a backend from the left.</p>
        )}
      </section>
    </div>
  );
}
