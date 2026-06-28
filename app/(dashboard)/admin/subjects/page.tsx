import { prisma } from '@/lib/prisma';
import { createSubject } from '@/actions/admin.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subjects</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Add Subject</CardTitle></CardHeader>
        <CardContent>
          <form action={createSubject} className="flex gap-2">
            <Input name="name" placeholder="Subject name" required />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-2 md:grid-cols-3">
        {subjects.map((s) => (
          <div key={s.id} className="rounded-xl border p-3 bg-[var(--surface)]">{s.name}</div>
        ))}
      </div>
    </div>
  );
}
