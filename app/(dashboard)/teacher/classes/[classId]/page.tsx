import { notFound } from 'next/navigation';
import { getClassWorkspace } from '@/actions/teacher.actions';
import { ClassWorkspaceTabs } from '@/components/dashboard/ClassWorkspaceTabs';

export default async function TeacherClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const data = await getClassWorkspace(classId);
  if (!data?.cls) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{data.cls.name}</h1>
      <p className="text-[var(--muted)] mb-6">Class workspace</p>
      <ClassWorkspaceTabs classId={classId} data={data} mode="teacher" />
    </div>
  );
}
