// app/search/page.tsx

import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'

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
  const params = await searchParams
  const rawQ = params.q
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? ''
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host')!
  const proto = hdrs.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  const origin = `${proto}://${host}`

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
    <div className="mt-14 p-4">
      <h1 className="text-2xl font-semibold mb-6">Search Files</h1>

      <form method="get" className="mb-6 flex">
        <input
          name="q"
          defaultValue={q}
          placeholder="filename…"
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l"
        />
        <button
          type="submit"
          className="px-4 bg-primary-500 text-white rounded-r hover:bg-primary-600"
        >
          Search
        </button>
      </form>

      {q && results.length === 0 && (
        <p className="text-gray-700 dark:text-gray-300">
          No files found for “{q}”.
        </p>
      )}

      <ul className="space-y-2">
        {results.map((r) => {
          const be = backends.find((b) => b.id === r.backendId)
          const label = be ? `${be.id} – ${be.name}` : `${r.backendId}`

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
          )
        })}
      </ul>
    </div>
  )
}
