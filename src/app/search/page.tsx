// app/search/page.tsx

import React from 'react'
import Link from 'next/link'

type SearchResult = {
  id: number
  backendId: number
  path: string
  isDirectory: boolean
}

type Backend = {
  id: number
  name: string
}

export default async function SearchPage({
  searchParams,
}: {
  /**
   * Next.js 15 passes searchParams as a Promise
   * whose resolved value is an object mapping each
   * query key to string | string[] | undefined.
   */
  searchParams: Promise<{ q?: string | string[] }>
}) {
  // 1) await the incoming Promise
  const params = await searchParams

  // 2) normalize q to a single string
  const rawQ = params.q
  const q = Array.isArray(rawQ)
    ? rawQ[0]
    : rawQ ?? ''

  // 3) fetch everything on the server, no client hooks needed
  const [backends, results] = await Promise.all([
    fetch('/api/backends', { cache: 'no-store' })
      .then((r) => r.json()) as Promise<Backend[]>,
    q
      ? fetch(`/api/files/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
          .then((r) => r.json()) as Promise<SearchResult[]>
      : Promise.resolve([]),
  ])

  return (
    <>
      <h1>Search Files</h1>

      <form method="get" style={{ marginBottom: '1em' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="filename…"
          style={{ marginRight: '0.5ch' }}
        />
        <button type="submit">Search</button>
      </form>

      {q && results.length === 0 && <p>No files found for “{q}”.</p>}

      <ul>
        {results.map((r) => {
          const be = backends.find((b) => b.id === r.backendId)
          const label = be ? `${be.id} – ${be.name}` : `${r.backendId}`

          return (
            <li key={r.id}>
              {r.isDirectory ? '📁' : '📄'}{' '}
              <span style={{ fontStyle: 'italic', marginRight: '0.5ch' }}>
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
          )
        })}
      </ul>
    </>
  )
}
