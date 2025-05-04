// src/app/explorer/explorer-client.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

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
    if (!p.endsWith('/')) p += '/';
    updateUrl(backendId, p);
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Backends</h2>
        <ul>
          {backends.map(b => (
            <li key={b.id}>
              <button
                onClick={() => updateUrl(b.id, '/')}
                className={b.id === backendId ? styles.active : undefined}
              >
                {b.id}: {b.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.main}>
        <h1>Explorer</h1>

        {backendId != null ? (
          <>
            <div className={styles.pathBar}>
              <input
                placeholder="Enter folder..."
                value={pathInput}
                onChange={e => setPathInput(e.target.value)}
              />
              <button onClick={onGo}>Go</button>
            </div>

            <div className={styles.upBar}>
              <button onClick={goUp} disabled={pathParam === '/'}>
                ↑ Up
              </button>
              <span className={styles.cwd}>{pathParam}</span>
            </div>

            <ul className={styles.entries}>
              {entries.map(e => (
                <li key={e.id}>
                  {e.isDirectory ? '📁' : '📄'}{' '}
                  {e.isDirectory ? (
                    <button
                      onClick={() => {
                        const dir = e.path.endsWith('/') ? e.path : e.path + '/';
                        updateUrl(backendId, dir);
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
          <p>Please select a backend from above.</p>
        )}
      </section>
    </div>
  );
}
