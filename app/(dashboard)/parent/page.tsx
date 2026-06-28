import Link from 'next/link';
import { getParentChildren, getParentNotifications } from '@/actions/parent.actions';
import { requireParent } from '@/lib/auth/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ParentDashboardPage() {
  const user = await requireParent();
  const [children, notifications] = await Promise.all([
    getParentChildren(),
    getParentNotifications(user.id),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Parent Portal</h1>
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {children.map((child) => (
          <Card key={child.id}>
            <CardHeader><CardTitle>{child.user.name}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted)]">{child.class.name} · Roll {child.rollNumber}</p>
              <p className="text-sm">Attendance: {child.attendancePct}%</p>
              <Link href={`/parent/children/${child.id}`} className="text-sm text-[var(--cyan)]">View details →</Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <h2 className="font-semibold mb-3">Notifications</h2>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="rounded-xl border p-3 text-sm">
            <div className="font-medium">{n.title}</div>
            <div className="text-[var(--muted)]">{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
