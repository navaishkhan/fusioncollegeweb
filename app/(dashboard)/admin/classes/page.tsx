import { prisma } from '@/lib/prisma';
import { createClass, assignClassSubject } from '@/actions/admin.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminClassesPage() {
  const [classes, subjects, teachers] = await Promise.all([
    prisma.class.findMany({ include: { students: true, classSubjects: { include: { subject: true, teacher: { include: { user: true } } } } } }),
    prisma.subject.findMany(),
    prisma.teacher.findMany({ include: { user: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classes</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Create Class</CardTitle></CardHeader>
        <CardContent>
          <form action={createClass} className="flex flex-wrap gap-2">
            <Input name="name" placeholder="Class name e.g. FSC-I-A" required />
            <Input name="group" placeholder="Group" />
            <Input name="academicYear" defaultValue="2026" />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      {classes.map((c) => (
        <Card key={c.id} className="mb-4">
          <CardHeader>
            <CardTitle>{c.name}</CardTitle>
            <p className="text-sm text-[var(--muted)]">{c.students.length} students</p>
          </CardHeader>
          <CardContent>
            <form action={assignClassSubject} className="flex flex-wrap gap-2 mb-3">
              <input type="hidden" name="classId" value={c.id} />
              <select name="subjectId" className="rounded-xl border px-3 h-10" required>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select name="teacherId" className="rounded-xl border px-3 h-10">
                <option value="">Teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
              </select>
              <Button type="submit" size="sm">Assign Subject</Button>
            </form>
            <ul className="text-sm space-y-1">
              {c.classSubjects.map((cs) => (
                <li key={cs.id}>{cs.subject.name} — {cs.teacher?.user.name || 'Unassigned'}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
