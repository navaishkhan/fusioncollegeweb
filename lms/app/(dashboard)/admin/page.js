import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/utils/db';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user has ADMIN role
  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { role: true },
    });
  } catch (err) {
    console.error('Error fetching user role:', err);
  }

  if (!dbUser || dbUser.role !== 'ADMIN') {
    // If user doesn't have ADMIN role, redirect to their actual dashboard
    if (dbUser) {
      redirect(`/${dbUser.role.toLowerCase()}`);
    } else {
      redirect('/login');
    }
  }

  // Fetch admin profile
  let admin = null;
  let enquiries = [];
  let userCount = 0;
  let teacherCount = 0;
  let studentCount = 0;
  let classCount = 0;
  let subjectCount = 0;
  let recentStudents = [];
  let recentTeachers = [];

  try {
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        admin: true,
      },
    });
    admin = dbUser?.admin;

    // Fetch stats from DB
    studentCount = await prisma.student.count();
    teacherCount = await prisma.teacher.count();
    userCount = await prisma.user.count();
    classCount = await prisma.class.count();
    subjectCount = await prisma.subject.count();

    // Fetch recent students
    recentStudents = await prisma.student.findMany({
      include: {
        user: true,
        class: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Fetch recent teachers
    recentTeachers = await prisma.teacher.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Fetch contact enquiries from DB
    enquiries = await prisma.contactEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  } catch (err) {
    console.error('Error fetching admin data:', err);
  }

  const adminName = admin?.name || user.email;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e233d] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Admin</h1>
          <p className="text-zinc-400 text-sm mt-1">Welcome back, {adminName}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Students</div>
          <div className="text-3xl font-black text-cyan-400 mt-2">{studentCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Enrolled</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Teachers</div>
          <div className="text-3xl font-black text-white mt-2">{teacherCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Faculty</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Classes</div>
          <div className="text-3xl font-black text-white mt-2">{classCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Active</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Subjects</div>
          <div className="text-3xl font-black text-white mt-2">{subjectCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Available</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Users</div>
          <div className="text-3xl font-black text-white mt-2">{userCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Registered</p>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Students</h2>
            <Link href="/admin/students" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentStudents.length === 0 ? (
              <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-8 text-center text-zinc-500 text-sm">
                No students yet. Create users in Supabase with STUDENT role.
              </div>
            ) : (
              recentStudents.map((student) => (
                <div key={student.id} className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-5 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-white">{student.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{student.rollNumber}</div>
                    <div className="text-[10px] text-zinc-500">{student.class?.name || 'No class'}</div>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Teachers Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Teachers</h2>
            <Link href="/admin/teachers" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentTeachers.length === 0 ? (
              <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-8 text-center text-zinc-500 text-sm">
                No teachers yet. Create users in Supabase with TEACHER role.
              </div>
            ) : (
              recentTeachers.map((teacher) => (
                <div key={teacher.id} className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-5 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-white">{teacher.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{teacher.qualification || 'No qualification'}</div>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Link href="/admin/students" className="px-4 py-3 bg-[#0d0f1a] border border-[#1e233d] rounded-lg text-sm font-medium text-white hover:bg-[#1e233d] transition-colors text-center">
            Manage Students
          </Link>
          <Link href="/admin/teachers" className="px-4 py-3 bg-[#0d0f1a] border border-[#1e233d] rounded-lg text-sm font-medium text-white hover:bg-[#1e233d] transition-colors text-center">
            Manage Teachers
          </Link>
          <Link href="/admin/classes" className="px-4 py-3 bg-[#0d0f1a] border border-[#1e233d] rounded-lg text-sm font-medium text-white hover:bg-[#1e233d] transition-colors text-center">
            Manage Classes
          </Link>
          <Link href="/admin/subjects" className="px-4 py-3 bg-[#0d0f1a] border border-[#1e233d] rounded-lg text-sm font-medium text-white hover:bg-[#1e233d] transition-colors text-center">
            Manage Subjects
          </Link>
          <Link href="/admin/notifications" className="px-4 py-3 bg-[#0d0f1a] border border-[#1e233d] rounded-lg text-sm font-medium text-white hover:bg-[#1e233d] transition-colors text-center">
            Notifications
          </Link>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight">Recent Enquiries</h2>
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-8 text-center text-zinc-500 text-sm">
              No enquiries yet.
            </div>
          ) : (
            enquiries.map((enquiry) => (
              <div key={enquiry.id} className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-sm text-white">{enquiry.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{enquiry.email}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${enquiry.status === 'UNREAD' ? 'bg-amber-950/50 text-amber-400 border border-amber-500/20' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'}`}>
                    {enquiry.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 border-t border-[#1e233d] pt-2">
                  {enquiry.message}
                </div>
                <div className="text-[10px] text-zinc-500">
                  {new Date(enquiry.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
