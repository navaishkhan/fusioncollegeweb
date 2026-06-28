import { requireAdmin } from '@/lib/auth/session';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
