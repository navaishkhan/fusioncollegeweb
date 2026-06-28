import Link from 'next/link';
import { requireTeacher } from '@/lib/auth/session';
import { getTeacherClasses } from '@/actions/teacher.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function TeacherDashboardPage() {
  const user = await requireTeacher();
  const classes = user.teacherId ? await getTeacherClasses(user.teacherId) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Classes</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {classes.map((c) => (
          <Link key={c.id} href={`/teacher/classes/${c.id}`}>
            <Card className="hover:shadow-[var(--clay-shadow-hover)] transition-shadow">
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
                {c.isIncharge && <Badge>Incharge</Badge>}
              </CardHeader>
              <CardContent><p className="text-sm text-[var(--muted)]">Open class workspace →</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
