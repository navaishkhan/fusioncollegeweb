import { requireStudent } from '@/lib/auth/session';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
