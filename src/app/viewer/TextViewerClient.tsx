'use client';

import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface TextViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function TextViewerClient({ fileUrl, fileName }: TextViewerProps) {
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

  // Determine language based on file extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    csv: 'plaintext',
    txt: 'plaintext',
  };
  const language = languageMap[extension || ''] || 'plaintext';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter 
          language={language} 
          style={atomOneDark}
          showLineNumbers
          customStyle={{ margin: 0, borderRadius: 0 }}
        >
          {content}
        </SyntaxHighlighter>
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
