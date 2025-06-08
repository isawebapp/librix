import './globals.css'
import NavBar from './nav-bar'
import { Suspense } from 'react'
import { ThemeProvider } from 'next-themes'

export const metadata = {
  title: 'Media Explorer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="bg-gray-100 dark:bg-gray-900"
      style={{ colorScheme: 'light dark' }}
    >
      <head>
        <link rel="preload" href="/pdf.worker.min.js" as="script" />
      </head>
      <body className="min-h-screen text-gray-900 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<div>Loading…</div>}>
            <NavBar />
          </Suspense>
          <main className="p-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
