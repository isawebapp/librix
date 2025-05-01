// app/settings/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import SettingsClient from './admin-client';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // not signed in → send to login, then back here
    redirect('/api/auth/signin?callbackUrl=/admin');
  }
  if (session.user.role !== 'admin') {
    // signed in but not admin → home
    redirect('/');
  }
  // admin → render the client UI
  return <SettingsClient />;
}
