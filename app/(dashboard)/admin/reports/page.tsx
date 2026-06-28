import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const reports = [
  { href: '/api/reports/attendance/export', title: 'Attendance Report', desc: 'Export by class, student, or date range' },
  { href: '/api/reports/performance/export', title: 'Test Performance', desc: 'Exam results by session or month' },
  { href: '/api/reports/student/export', title: 'Complete Student Report', desc: 'Profile, attendance, and all test results' },
  { href: '/api/reports/teacher/export', title: 'Teacher Activity', desc: 'Classes, attendance marked, assignments' },
];

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.href}>
            <CardHeader><CardTitle className="text-base">{r.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted)] mb-3">{r.desc}</p>
              <Link href={r.href} className="text-sm text-[var(--cyan)]">Export Excel →</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
