import './globals.css'
import NavBar from './nav-bar'
import { Suspense } from 'react'

export const metadata = { title: 'Media Explorer' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading…</div>}>
          <NavBar />
        </Suspense>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
