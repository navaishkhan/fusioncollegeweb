import { prisma } from '@/lib/prisma';
import { createUser } from '@/actions/auth.actions';
import { disableUser } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({ include: { user: true } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Teachers</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Add Teacher</CardTitle></CardHeader>
        <CardContent>
          <form action={createUser} className="grid gap-2 md:grid-cols-2">
            <input type="hidden" name="role" value="TEACHER" />
            <Input name="name" placeholder="Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="phone" placeholder="Phone" />
            <Input name="password" type="password" placeholder="Password (optional)" />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {teachers.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border p-3 bg-[var(--surface)]">
            <div>
              <div className="font-medium">{t.user.name}</div>
              <div className="text-sm text-[var(--muted)]">{t.user.email}</div>
            </div>
            <form action={disableUser.bind(null, t.user.id)}>
              <Button variant="destructive" size="sm" type="submit">Disable</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
