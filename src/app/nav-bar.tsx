'use client';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function NavBar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const isViewer     = pathname.startsWith('/viewer');
  const fileName     = isViewer
    ? searchParams.get('path')?.split('/').pop()
    : null;

  return (
    <nav
      style={{
        position: 'relative',
        padding: 16,
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isViewer ? 'center' : 'flex-start',
      }}
    >
      {isViewer && (
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            left: 16,
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      )}
      {isViewer && fileName ? (
        <h1 style={{ margin: 0 }}>{fileName}</h1>
      ) : (
        <>
          <Link href="/search">Search</Link> |{' '}
          <Link href="/explorer">Explorer</Link> |{' '}
          <Link href="/admin">Admin</Link>
        </>
      )}
    </nav>
  );
}
