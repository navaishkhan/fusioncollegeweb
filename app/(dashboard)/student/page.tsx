import Link from 'next/link';
import { requireStudent } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAttendancePercentage } from '@/lib/grades';

export default async function StudentDashboardPage() {
  const user = await requireStudent();
  const student = user.studentId
    ? await prisma.student.findUnique({
        where: { id: user.studentId },
        include: { class: true, attendances: true, examResults: { include: { exam: true } }, submissions: true },
      })
    : null;

  const present = student?.attendances.filter((a) => a.status === 'PRESENT').length || 0;
  const total = student?.attendances.length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      {student && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card><CardHeader><CardTitle className="text-sm">Class</CardTitle></CardHeader><CardContent>{student.class.name}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Attendance</CardTitle></CardHeader><CardContent>{getAttendancePercentage(present, total)}%</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Submissions</CardTitle></CardHeader><CardContent>{student.submissions.length}</CardContent></Card>
          </div>
          <Link href={`/student/classes/${student.classId}`} className="text-[var(--cyan)]">Open class →</Link>
        </>
      )}
    </div>
  );
}
