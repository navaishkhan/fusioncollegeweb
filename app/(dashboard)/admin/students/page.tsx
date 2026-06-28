import { prisma } from '@/lib/prisma';
import { createStudent } from '@/actions/admin.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminStudentsPage() {
  const [students, classes] = await Promise.all([
    prisma.student.findMany({ include: { user: true, class: true } }),
    prisma.class.findMany(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Students</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Add Student</CardTitle></CardHeader>
        <CardContent>
          <form action={createStudent} className="grid gap-2 md:grid-cols-2">
            <input type="hidden" name="role" value="STUDENT" />
            <Input name="name" placeholder="Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="fatherName" placeholder="Father Name" required />
            <Input name="rollNumber" placeholder="Roll Number" required />
            <select name="classId" className="rounded-xl border px-3 h-10" required>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input name="phone" placeholder="Phone" />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.id} className="rounded-xl border p-3 bg-[var(--surface)]">
            <div className="font-medium">{s.user.name}</div>
            <div className="text-sm text-[var(--muted)]">{s.rollNumber} · {s.class.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
