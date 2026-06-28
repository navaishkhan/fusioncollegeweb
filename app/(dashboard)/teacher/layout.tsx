import { requireTeacher } from '@/lib/auth/session';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeacher();
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
