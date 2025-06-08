// src/app/admin/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminClient from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }
  const user = session.user as { role?: string };
  if (user.role !== 'admin') {
    redirect('/');
  }
  return (
    <div className="mt-14 p-4">
      <AdminClient />
    </div>
  );
}
