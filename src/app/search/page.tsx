// src/app/search/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const qParam = params.get('q') || '';

  const [q, setQ] = useState(qParam);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [backends, setBackends] = useState<Backend[]>([]);

  // load backend names once
  useEffect(() => {
    fetch('/api/backends')
      .then((r) => r.json())
      .then(setBackends);
  }, []);

  // whenever the URL ?q= changes (including on Back), refetch
  useEffect(() => {
    setQ(qParam);
    if (!qParam) {
      setResults([]);
      return;
    }
    fetch(`/api/files/search?q=${encodeURIComponent(qParam)}`)
      .then((r) => r.json())
      .then(setResults);
  }, [qParam]);

  // on form submit, push new URL entry
  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/search');
    }
  }

  return (
    <>
      <h1>Search Files</h1>
      <form onSubmit={onSearch}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="filename..."
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {results.map((r) => {
          const be = backends.find((b) => b.id === r.backendId);
          const label = be ? `${be.id} - ${be.name}` : `${r.backendId}`;
          return (
            <li key={r.id}>
              {r.isDirectory ? '📁' : '📄'}{' '}
              <span style={{ marginRight: '0.5ch', fontStyle: 'italic' }}>
                [{label}]
              </span>
              <Link
                href={`/viewer?backendId=${r.backendId}&path=${encodeURIComponent(
                  r.path
                )}`}
              >
                {r.path}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
