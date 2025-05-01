import './globals.css';
import NavBar from './nav-bar';

export const metadata = { title: 'Media Explorer' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
