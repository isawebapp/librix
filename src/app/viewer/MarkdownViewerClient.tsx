'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function MarkdownViewerClient({ fileUrl, fileName }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const text = await response.text();
        setContent(text);
        setLoading(false);
      } catch (err) {
        setError('Failed to load file content');
        setLoading(false);
      }
    };

    fetchContent();
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4 text-red-500">{error}</p>
        <a
          href={fileUrl}
          download={fileName}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download {fileName}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            a: ({ node, ...props }) => (
              <a {...props} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" />
            ),
            code: ({ node, inline, className, children, ...props }) => {
              if (inline) {
                return <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded" {...props}>{children}</code>;
              }
              return <code className={className} {...props}>{children}</code>;
            },
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="border border-gray-300 px-4 py-2 bg-gray-100 dark:bg-gray-700" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-gray-300 px-4 py-2" {...props} />
            ),
          }}
          className="prose dark:prose-invert max-w-none"
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className="p-4 bg-gray-100 dark:bg-gray-700 flex justify-end">
        <a
          href={fileUrl}
          download={fileName}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download
        </a>
      </div>
    </div>
  );
}
