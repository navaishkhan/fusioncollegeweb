import { prisma } from '@/lib/prisma';
import { createExam } from '@/actions/admin.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default async function AdminExamsPage() {
  const [exams, sessions, classes, subjects, teachers] = await Promise.all([
    prisma.exam.findMany({ include: { class: true, subject: true, session: true }, orderBy: { date: 'desc' } }),
    prisma.testSession.findMany(),
    prisma.class.findMany(),
    prisma.subject.findMany(),
    prisma.teacher.findMany({ include: { user: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Exams</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Schedule Exam</CardTitle></CardHeader>
        <CardContent>
          <form action={createExam} className="grid gap-2 md:grid-cols-2">
            <Input name="name" placeholder="Exam name" required />
            <select name="sessionId" className="rounded-xl border px-3 h-10">
              <option value="">No session</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select name="classId" className="rounded-xl border px-3 h-10" required>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="subjectId" className="rounded-xl border px-3 h-10" required>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Input name="date" type="date" required />
            <Input name="totalMarks" type="number" defaultValue="100" />
            <select name="teacherId" className="rounded-xl border px-3 h-10">
              <option value="">Teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
            </select>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      {exams.map((e) => (
        <div key={e.id} className="mb-2 rounded-xl border p-3">
          <div className="font-medium">{e.name}</div>
          <div className="text-sm text-[var(--muted)]">{e.class.name} · {e.subject.name} · {formatDate(e.date)} · {e.status}</div>
        </div>
      ))}
    </div>
  );
}
