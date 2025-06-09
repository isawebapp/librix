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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    <div className="mt-14 flex flex-col md:flex-row h-screen">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden flex items-center p-2 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="mr-2 text-gray-700 dark:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Explorer</h1>
      </div>

      {/* Sidebar - hidden on mobile when not active */}
      <aside className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-56 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4`}>
        <div className="flex justify-between items-center mb-4 md:block">
          <h2 className="text-lg font-semibold">Backends</h2>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="space-y-2">
          {backends.map(b => (
            <li key={b.id}>
              <button
                onClick={() => {
                  updateUrl(b.id, '/');
                  setMobileSidebarOpen(false);
                }}
                className={`${b.id === backendId ? 'bg-gray-200 dark:bg-gray-700' : ''} w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600`}
              >
                {b.id}: {b.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 p-4 overflow-y-auto">
        <h1 className="hidden md:block text-2xl font-semibold mb-4">Explorer</h1>

        {backendId != null ? (
          <>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm md:text-base"
                placeholder="Enter folder..."
                value={pathInput}
                onChange={e => setPathInput(e.target.value)}
              />
              <button
                onClick={onGo}
                className="md:ml-2 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 text-sm md:text-base"
              >
                Go
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={goUp}
                disabled={pathParam === '/'}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 flex-shrink-0"
              >
                ↑ Up
              </button>
              <div className="flex-grow min-w-0">
                <span className="font-mono truncate block">{decodeURIComponent(pathParam)}</span>
              </div>
            </div>

            <ul className="space-y-2">
              {entries.map(e => (
                <li key={e.id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
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
