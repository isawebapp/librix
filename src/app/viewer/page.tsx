// app/viewer/page.tsx

import React from 'react'
import Image from 'next/image'
import styles from './page.module.css'

type ViewerPageProps = {
  // Next.js 15 passes searchParams in props as a Promise
  searchParams: Promise<{
    backendId?: string | string[]
    path?: string | string[]
  }>
}

export default async function ViewerPage({
  searchParams,
}: ViewerPageProps) {
  // 1) Wait for Next.js to give us the actual params object
  const params = await searchParams

  // 2) Normalize backendId and path to single strings
  const rawBackend = params.backendId
  const backendId =
    typeof rawBackend === 'string'
      ? rawBackend
      : Array.isArray(rawBackend)
        ? rawBackend[0]
        : ''

  const rawPath = params.path
  const path =
    typeof rawPath === 'string'
      ? rawPath
      : Array.isArray(rawPath)
        ? rawPath[0]
        : ''

  // 3) Build the API URL (will be fetched by the browser when the page loads)
  const src = `/api/files/view?backendId=${encodeURIComponent(
    backendId
  )}&path=${encodeURIComponent(path)}`

  // 4) Choose the viewer based on file extension
  const ext = path.split('.').pop()?.toLowerCase()

  let viewerElement: React.ReactNode
  if (ext === 'pdf') {
    viewerElement = (
      <iframe
        src={src}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    )
  } else if (
    ext &&
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)
  ) {
    viewerElement = (
      <Image
        src={src}
        alt={path}
        width={800}
        height={600}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        unoptimized
      />

    )
  } else if (ext && ['mp4', 'webm', 'ogg'].includes(ext)) {
    viewerElement = (
      <video
        src={src}
        controls
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    )
  } else {
    viewerElement = (
      <a href={src} target="_blank" rel="noopener noreferrer">
        Download {path.split('/').pop()}
      </a>
    )
  }

  return (
    <div className={styles.container}>
      {viewerElement}
    </div>
  )
}
