import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/utils/db';
import Link from 'next/link';

export default async function AdminStudentsPage() {
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
    if (dbUser) {
      redirect(`/${dbUser.role.toLowerCase()}`);
    } else {
      redirect('/login');
    }
  }

  // Fetch all students with their class info
  let students = [];
  try {
    students = await prisma.student.findMany({
      include: {
        user: true,
        class: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Error fetching students:', err);
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e233d] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Students</h1>
          <p className="text-zinc-400 text-sm mt-1">View and manage all enrolled students</p>
        </div>
        <Link href="/admin" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Students Table */}
      <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl overflow-hidden">
        {students.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No students yet. Create users in Supabase with STUDENT role.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e233d] text-xs font-bold uppercase tracking-wider text-zinc-400 bg-[#16192b]/50">
                  <th className="p-4">Name</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e233d] text-sm text-zinc-300">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#16192b]/20 transition-colors">
                    <td className="p-4 font-semibold text-white">{student.name}</td>
                    <td className="p-4">{student.rollNumber}</td>
                    <td className="p-4">{student.user?.email || 'N/A'}</td>
                    <td className="p-4">{student.class?.name || 'Not assigned'}</td>
                    <td className="p-4">{new Date(student.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 bg-[#1e233d] border border-[#2b3052] rounded text-cyan-400 hover:bg-cyan-950/20 transition-colors cursor-pointer">
                          Edit
                        </button>
                        <button className="text-xs px-2 py-1 bg-[#1e233d] border border-[#2b3052] rounded text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-2">How to Add New Students</h3>
        <ol className="text-xs text-zinc-400 space-y-1 list-decimal list-inside">
          <li>Create a user in Supabase Dashboard Authentication section</li>
          <li>Set user metadata role to STUDENT</li>
          <li>User logs in - their student profile is created automatically</li>
          <li>Use the API to update their class assignment and roll number</li>
        </ol>
      </div>
    </div>
  );
}
