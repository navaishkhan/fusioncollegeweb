import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/utils/db';
import Link from 'next/link';

export default async function AdminNotificationsPage() {
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

  // Fetch recent notification history
  let notifications = [];
  try {
    notifications = await prisma.attendanceNotification.findMany({
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }

  // Calculate stats
  const total = notifications.length;
  const sent = notifications.filter(n => n.status === 'SENT').length;
  const failed = notifications.filter(n => n.status === 'FAILED').length;
  const pending = notifications.filter(n => n.status === 'PENDING').length;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e233d] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Attendance Notifications</h1>
          <p className="text-zinc-400 text-sm mt-1">View and manage WhatsApp attendance alerts</p>
        </div>
        <Link href="/admin" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total</div>
          <div className="text-3xl font-black text-white mt-2">{total}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Notifications</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Sent</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{sent}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Successfully</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Failed</div>
          <div className="text-3xl font-black text-red-400 mt-2">{failed}</div>
          <p className="text-[10px] text-zinc-500 mt-1">With errors</p>
        </div>
        <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Pending</div>
          <div className="text-3xl font-black text-amber-400 mt-2">{pending}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Not sent</p>
        </div>
      </div>

      {/* Configuration Instructions */}
      <div className="bg-[#16192b]/50 border border-[#1e233d] rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-3">WhatsApp Configuration</h3>
        <div className="text-xs text-zinc-400 space-y-2">
          <p>To enable WhatsApp notifications, add these environment variables:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="text-cyan-400">WHATSAPP_PROVIDER</code> - twilio or meta</li>
            <li><code className="text-cyan-400">TWILIO_ACCOUNT_SID</code> - Your Twilio account SID</li>
            <li><code className="text-cyan-400">TWILIO_AUTH_TOKEN</code> - Your Twilio auth token</li>
            <li><code className="text-cyan-400">WHATSAPP_FROM_NUMBER</code> - Your WhatsApp business number</li>
            <li><code className="text-cyan-400">META_WHATSAPP_ACCESS_TOKEN</code> - Meta API access token (if using Meta)</li>
            <li><code className="text-cyan-400">META_WHATSAPP_PHONE_NUMBER_ID</code> - Meta phone number ID (if using Meta)</li>
          </ul>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-[#0d0f1a] border border-[#1e233d] rounded-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No notifications sent yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e233d] text-xs font-bold uppercase tracking-wider text-zinc-400 bg-[#16192b]/50">
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Sent At</th>
                  <th className="p-4">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e233d] text-sm text-zinc-300">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-[#16192b]/20 transition-colors">
                    <td className="p-4 font-semibold text-white">{notification.student.name}</td>
                    <td className="p-4">{notification.student.rollNumber}</td>
                    <td className="p-4">{notification.student.class.name}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                        notification.status === 'SENT' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' :
                        notification.status === 'FAILED' ? 'bg-red-950/50 text-red-400 border border-red-500/20' :
                        'bg-amber-950/50 text-amber-400 border border-amber-500/20'
                      }`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-4 text-xs text-red-400 max-w-xs truncate">
                      {notification.errorMessage || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
