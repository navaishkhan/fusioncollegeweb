import { prisma } from '@/lib/prisma';
import { createTestSession } from '@/actions/admin.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default async function AdminTestSessionsPage() {
  const sessions = await prisma.testSession.findMany({ include: { exams: true }, orderBy: { startDate: 'desc' } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Test Sessions</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Schedule Session</CardTitle></CardHeader>
        <CardContent>
          <form action={createTestSession} className="grid gap-2 md:grid-cols-2">
            <Input name="name" placeholder="Session name" required />
            <Input name="startDate" type="date" required />
            <Input name="endDate" type="date" required />
            <Input name="instructions" placeholder="Instructions" />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      {sessions.map((s) => (
        <div key={s.id} className="mb-3 rounded-xl border p-3">
          <div className="font-medium">{s.name}</div>
          <div className="text-sm text-[var(--muted)]">{formatDate(s.startDate)} — {formatDate(s.endDate)} · {s.exams.length} exams</div>
        </div>
      ))}
    </div>
  );
}
