'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import PdfViewerClient from './PdfViewerClient';
import TextViewerClient from './TextViewerClient';
import AudioViewerClient from './AudioViewerClient';
import MarkdownViewerClient from './MarkdownViewerClient';
import VideoViewerClient from './VideoViewerClient';

export default function ViewerPage() {
  const searchParams = useSearchParams();
  
  const backendId = searchParams.get('backendId') || '';
  const path = searchParams.get('path') || '';
  
  const src = `/api/files/view?backendId=${encodeURIComponent(backendId)}&path=${encodeURIComponent(path)}`;
  const ext = path.split('.').pop()?.toLowerCase();

  let viewerElement: React.ReactNode;
  const fileName = path.split('/').pop() || '';
  
  if (ext === 'pdf') {
    viewerElement = <PdfViewerClient fileUrl={src} />;
  } else if (ext && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    viewerElement = (
      <Image
        src={src}
        alt={fileName}
        width={800}
        height={600}
        className="w-full h-full object-contain"
        unoptimized
      />
    );
  } else if (ext && ['mp4', 'webm', 'ogg'].includes(ext)) {
    viewerElement = <VideoViewerClient fileUrl={src} fileName={fileName} />;
  } else if (ext && ['txt', 'js', 'ts', 'html', 'css', 'json', 'xml', 'yaml', 'csv'].includes(ext)) {
    viewerElement = <TextViewerClient fileUrl={src} fileName={fileName} />;
  } else if (ext && ['mp3', 'wav'].includes(ext)) {
    viewerElement = <AudioViewerClient fileUrl={src} fileName={fileName} />;
  } else if (ext && ['md', 'markdown'].includes(ext)) {
    viewerElement = <MarkdownViewerClient fileUrl={src} fileName={fileName} />;
  } else {
    viewerElement = (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Preview not available for this file type</p>
        <a
          href={src}
          download={fileName}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download {fileName}
        </a>
      </div>
    );
  }

  return (
<div className="mt-16 md:mt-14 flex flex-col h-screen">
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-gray-800">
        {viewerElement}
      </div>
    </div>
  );
}
