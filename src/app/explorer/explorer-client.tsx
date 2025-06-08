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
      setEntries([]);
      fetch(`/api/files/explorer?backendId=${backendId}&path=${encodeURIComponent(pathParam)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setEntries(data);
        });
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
    <div className="flex mt-14 h-screen">
      <aside className="w-56 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Backends</h2>
        <ul className="space-y-2">
          {backends.map(b => (
            <li key={b.id}>
              <button
                onClick={() => updateUrl(b.id, '/')}
                className={`${b.id === backendId ? 'bg-gray-200 dark:bg-gray-700' : ''} w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600`}
              >
                {b.id}: {b.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4">Explorer</h1>

        {backendId != null ? (
          <>
            <div className="flex space-x-2 mb-4">
              <input
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                placeholder="Enter folder..."
                value={pathInput}
                onChange={e => setPathInput(e.target.value)}
              />
              <button
                onClick={onGo}
                className="ml-2 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Go
              </button>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={goUp}
                disabled={pathParam === '/'}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                ↑ Up
              </button>
              <span className="ml-2 font-mono">{decodeURIComponent(pathParam)}</span>
            </div>

            <ul className="space-y-2">
              {entries.map(e => (
                <li key={e.id} className="flex items-center space-x-2">
                  <span>{e.isDirectory ? '📁' : '📄'}</span>
                  {e.isDirectory ? (
                    <button
                      onClick={() => {
                        const dir = e.path.endsWith('/') ? e.path : e.path + '/';
                        updateUrl(backendId, dir);
                      }}
                      className="text-primary-500 hover:underline"
                    >
                      {decodeURIComponent(e.name)}
                    </button>
                  ) : (
                    <Link
                      href={`/viewer?backendId=${backendId}&path=${encodeURIComponent(e.path)}`}
                      className="text-primary-500 hover:underline"
                    >
                      {decodeURIComponent(e.name)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Please select a backend from above.</p>
        )}
      </section>
    </div>
  );
}
