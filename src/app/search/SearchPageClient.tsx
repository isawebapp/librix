'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type SearchResult = {
  id: number;
  backendId: number;
  path: string;
  isDirectory: boolean;
};

type Backend = {
  id: number;
  name: string;
};

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [backends, setBackends] = useState<Backend[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const backendsRes = await fetch('/api/backends', { cache: 'no-store' });
        if (backendsRes.ok) {
          setBackends(await backendsRes.json());
        }
        if (q) {
          const resultsRes = await fetch(`/api/files/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
          if (resultsRes.ok) {
            setResults(await resultsRes.json());
          } else {
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [q]);

  return (
    <div className="mt-14 p-4">
      <h1 className="text-2xl font-semibold mb-6">Search Files</h1>
      <form method="get" className="mb-6 flex">
        <input
          name="q"
          defaultValue={q}
          placeholder="filename..."
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l"
        />
        <button
          type="submit"
          className="px-4 bg-primary-500 text-white rounded-r hover:bg-primary-600"
        >
          Search
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {!loading && q && results.length === 0 && (
        <p className="text-gray-700 dark:text-gray-300">
          {`No files found for "${q}".`}
        </p>
      )}
      <ul className="space-y-2">
        {results.map((r) => {
          const be = backends.find((b) => b.id === r.backendId);
          const label = be ? `${be.id} - ${be.name}` : `${r.backendId}`;
          return (
            <li key={r.id} className="flex items-center space-x-2">
              <span>{r.isDirectory ? '📁' : '📄'}</span>
              <span className="italic text-gray-500">[{label}]</span>
              <Link
                href={`/viewer?backendId=${r.backendId}&path=${encodeURIComponent(r.path)}`}
                className="text-primary-500 hover:underline break-all"
              >
                {decodeURIComponent(r.path)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
