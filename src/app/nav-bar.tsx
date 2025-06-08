'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isViewer = pathname.startsWith('/viewer');
  const fileName = isViewer
    ? searchParams.get('path')?.split('/').pop()
    : null;

  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center">
      {isViewer ? (
        <>
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-700 dark:text-gray-300 hover:text-primary-500"
          >
            ← Back
          </button>
          <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100 text-center overflow-hidden whitespace-nowrap overflow-ellipsis">
            {mounted && fileName ? decodeURIComponent(fileName) : ''}
          </h1>
        </>
      ) : (
        <div className="flex space-x-4">
          <Link href="/search" className="text-gray-700 dark:text-gray-300 hover:text-primary-500">
            Search
          </Link>
          <Link href="/explorer" className="text-gray-700 dark:text-gray-300 hover:text-primary-500">
            Explorer
          </Link>
          <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary-500">
            Admin
          </Link>
        </div>
      )}
      <button
        onClick={toggleTheme}
        className="ml-auto text-gray-700 dark:text-gray-300 hover:text-primary-500"
        aria-label="Toggle Dark Mode"
      >
        {mounted && currentTheme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m8.66-12.66l-.707.707M4.047 19.95l-.707.707M21 12h-1M4 12H3m16.66 4.66l-.707-.707M4.047 4.05l-.707-.707M12 5a7 7 0 000 14 7 7 0 000-14z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor"
               viewBox="0 0 24 24" stroke="none">
            <path d="M12 2a9.953 9.953 0 00-7.071 2.929A9.953 9.953 0 002 12a9.953 9.953 0 002.929 7.071A9.953 9.953 0 0012 22a9.953 9.953 0 007.071-2.929A9.953 9.953 0 0022 12a9.953 9.953 0 00-2.929-7.071A9.953 9.953 0 0012 2z"/>
          </svg>
        )}
      </button>
    </nav>
  );
}
