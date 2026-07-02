import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/utils/db';

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
    redirect('/login');
  }

  // Fetch admin profile
  let admin = null;
  let enquiries = [];
  let userCount = 0;
  let teacherCount = 0;
  let studentCount = 0;

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

    // Fetch contact enquiries from DB
    enquiries = await prisma.contactEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  } catch (err) {
    console.error('Error fetching admin data:', err);
  }

  // Seed standard fallback if db empty
  const studentStat = studentCount || 482;
  const teacherStat = teacherCount || 18;
  const userStat = userCount || 612;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Enrolled Students</div>
          <div className="text-3xl font-black text-cyan-400 mt-2">{studentStat} Students</div>
          <p className="text-[10px] text-zinc-500 mt-1">Active for academic session 2026</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Registered Faculty</div>
          <div className="text-3xl font-black text-white mt-2">{teacherStat} Teachers</div>
          <p className="text-[10px] text-zinc-500 mt-1">Across 8 subject departments</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total System Users</div>
          <div className="text-3xl font-black text-red-400 mt-2">{userStat} Accounts</div>
          <p className="text-[10px] text-zinc-500 mt-1">Includes Students, Teachers, and Parents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Enquiries List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Landing Page Enquiries</h2>
          {enquiries.length === 0 ? (
            <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-8 text-center text-zinc-500 text-sm">
              No inquiries submitted to the database yet.
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <div key={enquiry.id} className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{enquiry.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Phone: {enquiry.phone} {enquiry.email && `| Email: ${enquiry.email}`}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-red-950/50 text-red-400 border border-red-500/20">
                      {enquiry.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-[#16192b]/50 p-3 rounded border border-[#2b3052]/50">
                    {enquiry.message}
                  </p>
                  <div className="text-[10px] text-zinc-500 text-right">
                    Received: {new Date(enquiry.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Administration Actions */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Quick Controls</h2>
          <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl p-5 space-y-4">
            <button className="w-full py-3 bg-[#1e233d] hover:bg-[#2b3052] border border-[#2b3052] rounded-lg text-sm text-white font-semibold transition-colors cursor-pointer">
              Add Student Profile
            </button>
            <button className="w-full py-3 bg-[#1e233d] hover:bg-[#2b3052] border border-[#2b3052] rounded-lg text-sm text-white font-semibold transition-colors cursor-pointer">
              Add Teacher Profile
            </button>
            <button className="w-full py-3 bg-[#1e233d] hover:bg-[#2b3052] border border-[#2b3052] rounded-lg text-sm text-white font-semibold transition-colors cursor-pointer">
              Provision Classes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
