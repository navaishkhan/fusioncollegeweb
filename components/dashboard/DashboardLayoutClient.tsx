'use client';

import { usePathname } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { SessionUser } from '@/lib/auth/session';

export function DashboardLayoutClient({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <DashboardShell user={user} pathname={pathname}>
      {children}
    </DashboardShell>
  );
}
