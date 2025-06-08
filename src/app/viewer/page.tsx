'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import PdfViewerClient from './PdfViewerClient';

export default function ViewerPage() {
  const searchParams = useSearchParams();
  
  const backendId = searchParams.get('backendId') || '';
  const path = searchParams.get('path') || '';
  
  const src = `/api/files/view?backendId=${encodeURIComponent(backendId)}&path=${encodeURIComponent(path)}`;
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
