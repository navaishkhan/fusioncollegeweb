import { notFound } from 'next/navigation';
import { requireParent } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getAttendancePercentage } from '@/lib/grades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default async function ParentChildPage({ params }: { params: Promise<{ studentId: string }> }) {
  const user = await requireParent();
  const { studentId } = await params;

  const link = await prisma.parentStudent.findFirst({
    where: { parentId: user.parentId!, studentId },
  });
  if (!link) notFound();

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      class: true,
      attendances: true,
      examResults: { include: { exam: true } },
      submissions: { include: { assignment: true } },
    },
  });
  if (!student) notFound();

  const present = student.attendances.filter((a) => a.status === 'PRESENT').length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{student.user.name}</h1>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card><CardHeader><CardTitle className="text-sm">Class</CardTitle></CardHeader><CardContent>{student.class.name}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Attendance</CardTitle></CardHeader><CardContent>{getAttendancePercentage(present, student.attendances.length)}%</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Tests</CardTitle></CardHeader><CardContent>{student.examResults.length}</CardContent></Card>
      </div>
      <h2 className="font-semibold mb-2">Recent Results</h2>
      {student.examResults.map((r) => (
        <div key={r.id} className="text-sm border-b py-1">{r.exam.name}: {r.marksObtained} ({r.grade})</div>
      ))}
      <h2 className="font-semibold mt-4 mb-2">Assignments</h2>
      {student.submissions.map((s) => (
        <div key={s.id} className="text-sm border-b py-1">{s.assignment.title} — {s.status} · {s.submittedAt ? formatDate(s.submittedAt) : 'Pending'}</div>
      ))}
    </div>
  );
}
