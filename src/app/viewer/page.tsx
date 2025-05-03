// src/app/viewer/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import Image from 'next/image';

export default function ViewerPage() {
  const params    = useSearchParams();
  const backendId = params.get('backendId');
  const path      = params.get('path') || '';

  const src = `/api/files/view?backendId=${backendId}&path=${encodeURIComponent(path)}`;

  const viewer = useMemo(() => {
    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <iframe
          src={src}
          style={{ width: '100%', height: '100vh', border: 'none' }}
        />
      );
    }
    if (['jpg','jpeg','png','gif','bmp','webp'].includes(ext || '')) {
      return (
        <Image
          src={src}
          alt={path}
          width={800}
          height={600}
          style={{ maxWidth: '100%', height: 'auto' }}
          unoptimized
        />
      );
    }
    if (['mp4','webm','ogg'].includes(ext || '')) {
      return (
        <video
          src={src}
          controls
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      );
    }
    // Fallback: download link
    return (
      <a href={src} target="_blank" rel="noopener noreferrer">
        Download {path.split('/').pop()}
      </a>
    );
  }, [src, path]);

  return <div style={{ padding: 20 }}>{viewer}</div>;
}
