'use client';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function ViewerPage() {
  const params    = useSearchParams();
  const backendId = params.get('backendId');
  const path      = params.get('path') || '';

  const src = `/api/files/view?backendId=${backendId}&path=${encodeURIComponent(path)}`;

  const viewer = useMemo(() => {
    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return <iframe src={src} style={{ width: '100%', height: '100vh' }} />;
    }
    if (['jpg','jpeg','png','gif','bmp','webp'].includes(ext || '')) {
      return <img src={src} alt={path} style={{ maxWidth: '100%' }} />;
    }
    if (['mp4','webm','ogg'].includes(ext || '')) {
      return <video src={src} controls style={{ maxWidth: '100%' }} />;
    }
    return (
      <a href={src} target="_blank" rel="noopener noreferrer">
        Download {path.split('/').pop()}
      </a>
    );
  }, [src, path]);

  return (
    <div style={{ padding: 20 }}>
      {viewer}
    </div>
  );
}
