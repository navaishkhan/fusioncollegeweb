import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminStats } from '@/actions/admin.actions';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--navy)] mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Students', stats.students],
          ['Teachers', stats.teachers],
          ['Classes', stats.classes],
          ['Subjects', stats.subjects],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="text-sm text-[var(--muted)]">{label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-[var(--navy)]">{value}</div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
