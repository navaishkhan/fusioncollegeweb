import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/utils/db';
import Link from 'next/link';

export default async function TeacherAttendancePage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user has TEACHER role
  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { role: true },
    });
  } catch (err) {
    console.error('Error fetching user role:', err);
  }

  if (!dbUser || dbUser.role !== 'TEACHER') {
    if (dbUser) {
      redirect(`/${dbUser.role.toLowerCase()}`);
    } else {
      redirect('/login');
    }
  }

  // Fetch class subject and students
  let classSubject = null;
  let students = [];

  try {
    classSubject = await prisma.classSubject.findUnique({
      where: { id: params.id },
      include: {
        class: true,
        subject: true,
        teacher: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    if (classSubject) {
      students = classSubject.students.map(s => s.student);
    }
  } catch (err) {
    console.error('Error fetching class data:', err);
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e233d] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Take Attendance</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {classSubject?.class.name} - {classSubject?.subject.name}
          </p>
        </div>
        <Link href="/teacher/classes" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
          &larr; Back to Classes
        </Link>
      </div>

      {!classSubject ? (
        <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-8 text-center text-zinc-500 text-sm">
          Class not found.
        </div>
      ) : (
        <>
          {/* Attendance Form */}
          <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-2">Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#16192b] border border-[#2b3052] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Mark Attendance</h3>
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="bg-[#16192b]/50 border border-[#2b3052] rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">{student.name}</div>
                      <div className="text-xs text-zinc-400">{student.rollNumber}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs px-3 py-1.5 bg-emerald-950/50 border border-emerald-500/20 rounded text-emerald-400 hover:bg-emerald-950/70 transition-colors cursor-pointer">
                        Present
                      </button>
                      <button className="text-xs px-3 py-1.5 bg-red-950/50 border border-red-500/20 rounded text-red-400 hover:bg-red-950/70 transition-colors cursor-pointer">
                        Absent
                      </button>
                      <button className="text-xs px-3 py-1.5 bg-amber-950/50 border border-amber-500/20 rounded text-amber-400 hover:bg-amber-950/70 transition-colors cursor-pointer">
                        Leave
                      </button>
                      <button className="text-xs px-3 py-1.5 bg-orange-950/50 border border-orange-500/20 rounded text-orange-400 hover:bg-orange-950/70 transition-colors cursor-pointer">
                        Late
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 border border-cyan-500 rounded-lg text-sm font-bold text-white transition-colors cursor-pointer">
              Submit Attendance
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">Instructions</h3>
            <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
              <li>Select the date for attendance</li>
              <li>Mark each student as Present, Absent, Leave, or Late</li>
              <li>Click Submit to save the attendance record</li>
              <li>Attendance will be recorded for the lecture</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
