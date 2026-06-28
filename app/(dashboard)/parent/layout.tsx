import { requireParent } from '@/lib/auth/session';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireParent();
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
