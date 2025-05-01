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

export default function ExplorerPage() {
  const router = useRouter();
  const params = useSearchParams();
  const backendIdParam = params.get('backendId') || '';
  const pathParam = params.get('path') || '/';

  const backendId = backendIdParam ? Number(backendIdParam) : null;
  const [backends, setBackends] = useState<{ id: number; name: string }[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    fetch('/api/backends')
      .then((r) => r.json())
      .then(setBackends);
  }, []);

  useEffect(() => {
    if (backendId != null) {
      fetch(
        `/api/files/explorer?backendId=${backendId}&path=${encodeURIComponent(
          pathParam
        )}`
      )
        .then((r) => r.json())
        .then(setEntries);
    }
  }, [backendId, pathParam]);

  const updateUrl = (newBackend: number | null, newPath: string) => {
    const url = newBackend
      ? `/explorer?backendId=${newBackend}&path=${encodeURIComponent(newPath)}`
      : '/explorer';
    router.push(url);
  };

  const onBackendChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    updateUrl(id, '/');
  };

  const onGo = () => {
    if (backendId != null) updateUrl(backendId, pathParam);
  };

  const goUp = () => {
    if (pathParam === '/') return;
    const trimmed = pathParam.endsWith('/')
      ? pathParam.slice(0, -1)
      : pathParam;
    const idx = trimmed.lastIndexOf('/');
    const parent = idx > 0 ? trimmed.slice(0, idx + 1) : '/';
    updateUrl(backendId, parent);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Explorer</h1>
      <select value={backendIdParam} onChange={onBackendChange}>
        <option value="">Select Backend…</option>
        {backends.map((b) => (
          <option key={b.id} value={b.id}>
            {b.id}: {b.name}
          </option>
        ))}
      </select>

      {backendId != null && (
        <>
          <div style={{ margin: '1em 0' }}>
            <button onClick={goUp} disabled={pathParam === '/'}>
              ↑ Up
            </button>{' '}
            <span style={{ fontFamily: 'monospace' }}>{pathParam}</span>{' '}
            <input
              style={{ width: '20ch' }}
              value={pathParam}
              onChange={(e) => {
                const p = e.target.value.startsWith('/')
                  ? e.target.value
                  : '/' + e.target.value;
                updateUrl(backendId, p);
              }}
            />{' '}
            <button onClick={onGo}>Go</button>
          </div>

          <ul>
            {entries.map((e) => (
              <li key={e.id}>
                {e.isDirectory ? '📁' : '📄'}{' '}
                {e.isDirectory ? (
                  <a
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      updateUrl(backendId, e.path);
                    }}
                  >
                    {e.name}
                  </a>
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
      )}
    </div>
  );
}
