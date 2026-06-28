import { prisma } from '@/lib/prisma';
import { createUser, disableUser } from '@/actions/auth.actions';
import { linkParentStudent } from '@/actions/admin.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminParentsPage() {
  const [parents, students] = await Promise.all([
    prisma.parent.findMany({ include: { user: true, studentLinks: { include: { student: { include: { user: true } } } } } }),
    prisma.student.findMany({ include: { user: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Parents</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Add Parent</CardTitle></CardHeader>
        <CardContent>
          <form action={createUser} className="grid gap-2 md:grid-cols-2">
            <input type="hidden" name="role" value="PARENT" />
            <Input name="name" placeholder="Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="phone" placeholder="Phone" />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader><CardTitle>Link Parent to Student</CardTitle></CardHeader>
        <CardContent>
          <form action={linkParentStudent} className="flex flex-wrap gap-2">
            <select name="parentId" className="rounded-xl border px-3 h-10" required>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.user.name}</option>)}
            </select>
            <select name="studentId" className="rounded-xl border px-3 h-10" required>
              {students.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}
            </select>
            <Button type="submit">Link</Button>
          </form>
        </CardContent>
      </Card>
      {parents.map((p) => (
        <div key={p.id} className="mb-3 rounded-xl border p-3">
          <div className="font-medium">{p.user.name}</div>
          <div className="text-sm text-[var(--muted)]">
            Children: {p.studentLinks.map((l) => l.student.user.name).join(', ') || 'None'}
          </div>
          <form action={disableUser.bind(null, p.user.id)} className="mt-2">
            <Button variant="destructive" size="sm" type="submit">Disable</Button>
          </form>
        </div>
      ))}
    </div>
  );
}
