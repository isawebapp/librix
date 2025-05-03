// app/search/page.tsx

import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import styles from './page.module.css'

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
  searchParams: Promise<{ q?: string | string[] }>
}) {
  // 1) await the incoming Promise for searchParams
  const params = await searchParams

  // 2) normalize q to a single string
  const rawQ = params.q
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? ''

  // 3) await headers() before using .get()
  const hdrs = await headers()
  // prefer X-Forwarded-Host if you're behind a proxy; fallback to Host
  const host =
    hdrs.get('x-forwarded-host') ??
    hdrs.get('host') ??
    'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  // 4) fetch with absolute URLs
  const [backends, results] = await Promise.all([
    fetch(`${origin}/api/backends`, { cache: 'no-store' })
      .then((r) => r.json()) as Promise<Backend[]>,
    q
      ? fetch(
          `${origin}/api/files/search?q=${encodeURIComponent(q)}`,
          { cache: 'no-store' }
        ).then((r) => r.json()) as Promise<SearchResult[]>
      : Promise.resolve([]),
  ])

  return (
    <div className={styles.container}>
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
              <span
                style={{ fontStyle: 'italic', marginRight: '0.5ch' }}
              >
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
    </div>
  )
}
