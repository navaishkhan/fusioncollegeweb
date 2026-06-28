import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { ROLE_HOME } from '@/lib/utils';

export default async function DashboardRedirectPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  redirect(ROLE_HOME[user.role] || '/login');
}
