import { notFound } from 'next/navigation';
import { requireStudent } from '@/lib/auth/session';
import { getClassWorkspace } from '@/actions/teacher.actions';
import { ClassWorkspaceTabs } from '@/components/dashboard/ClassWorkspaceTabs';

export default async function StudentClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const user = await requireStudent();
  const { classId } = await params;
  if (user.studentId) {
    const { prisma } = await import('@/lib/prisma');
    const student = await prisma.student.findUnique({ where: { id: user.studentId } });
    if (student?.classId !== classId) notFound();
  }
  const data = await getClassWorkspace(classId);
  if (!data?.cls) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{data.cls.name}</h1>
      <ClassWorkspaceTabs classId={classId} data={data} mode="student" />
    </div>
  );
}
