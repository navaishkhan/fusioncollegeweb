import { prisma } from '@/lib/prisma';
import { assignIncharge } from '@/actions/admin.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminInchargesPage() {
  const [classes, teachers, incharges] = await Promise.all([
    prisma.class.findMany(),
    prisma.teacher.findMany({ include: { user: true } }),
    prisma.classIncharge.findMany({
      where: { status: 'ACTIVE' },
      include: { class: true, teacher: { include: { user: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Class Incharges</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Assign Incharge</CardTitle></CardHeader>
        <CardContent>
          <form action={assignIncharge} className="flex flex-wrap gap-2">
            <select name="classId" className="rounded-xl border px-3 h-10" required>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="teacherId" className="rounded-xl border px-3 h-10" required>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
            </select>
            <Button type="submit">Assign</Button>
          </form>
        </CardContent>
      </Card>
      {incharges.map((i) => (
        <div key={i.id} className="mb-2 rounded-xl border p-3">
          {i.class.name} — {i.teacher.user.name}
        </div>
      ))}
    </div>
  );
}
