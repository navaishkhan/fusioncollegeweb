import { prisma } from '@/lib/prisma';
import { unlockAttendance, overrideAttendance } from '@/actions/admin.actions';
import { unlockAttendanceForm } from '@/actions/attendance.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default async function AdminAttendancePage() {
  const [locks, records] = await Promise.all([
    prisma.attendanceLock.findMany({ include: { class: true }, orderBy: { date: 'desc' }, take: 20 }),
    prisma.attendance.findMany({
      include: { student: { include: { user: true } }, class: true, subject: true },
      orderBy: { date: 'desc' },
      take: 30,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance Override</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Unlock Attendance</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {locks.map((l) => (
            <form key={l.id} action={unlockAttendanceForm} className="flex items-center justify-between rounded-lg border p-2">
              <input type="hidden" name="classId" value={l.classId} />
              <input type="hidden" name="date" value={l.date.toISOString().slice(0, 10)} />
              <span className="text-sm">{l.class.name} — {formatDate(l.date)}</span>
              <Button size="sm" variant="outline" type="submit">Unlock</Button>
            </form>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent Records</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {records.map((r) => (
            <form key={r.id} action={overrideAttendance} className="flex flex-wrap items-center gap-2 border-b py-2 text-sm">
              <input type="hidden" name="id" value={r.id} />
              <span>{r.student.user.name} · {r.class.name} · {formatDate(r.date)}</span>
              <select name="status" defaultValue={r.status} className="rounded border px-2 h-8">
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
                <option value="LEAVE">LEAVE</option>
              </select>
              <Button size="sm" type="submit">Update</Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
