// app/viewer/page.tsx
import React from 'react';
import Image from 'next/image';
import PdfViewerClient from './PdfViewerClient';

type ViewerPageProps = {
  searchParams: Promise<{
    backendId?: string | string[];
    path?: string | string[];
  }>;
};

export default async function ViewerPage({
  searchParams,
}: ViewerPageProps) {
  const params = await searchParams;

  const rawBackend = params.backendId;
  const backendId =
    typeof rawBackend === 'string'
      ? rawBackend
      : Array.isArray(rawBackend)
      ? rawBackend[0]
      : '';

  const rawPath = params.path;
  const path =
    typeof rawPath === 'string'
      ? rawPath
      : Array.isArray(rawPath)
      ? rawPath[0]
      : '';

  const src = `/api/files/view?backendId=${encodeURIComponent(
    backendId
  )}&path=${encodeURIComponent(path)}`;

  const ext = path.split('.').pop()?.toLowerCase();

  let viewerElement: React.ReactNode;
  if (ext === 'pdf') {
    viewerElement = <PdfViewerClient fileUrl={src} />;
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
        className="w-full h-full object-contain"
        unoptimized
      />
    );
  } else if (ext && ['mp4', 'webm', 'ogg'].includes(ext)) {
    viewerElement = (
      <video
        src={src}
        controls
        className="w-full h-full object-contain"
      />
    );
  } else {
    viewerElement = (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-500 underline"
      >
        Download {path.split('/').pop()}
      </a>
    );
  }

  return (
    <div className="mt-14 flex flex-col h-screen">
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-gray-800">
        {viewerElement}
      </div>
    </div>
  );
}
