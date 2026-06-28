import Link from 'next/link';
import { signOut } from '@/actions/auth.actions';
import type { SessionUser } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

const NAV: Record<string, { href: string; label: string }[]> = {
  ADMIN: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/teachers', label: 'Teachers' },
    { href: '/admin/students', label: 'Students' },
    { href: '/admin/parents', label: 'Parents' },
    { href: '/admin/classes', label: 'Classes' },
    { href: '/admin/subjects', label: 'Subjects' },
    { href: '/admin/incharges', label: 'Incharges' },
    { href: '/admin/test-sessions', label: 'Test Sessions' },
    { href: '/admin/exams', label: 'Exams' },
    { href: '/admin/attendance', label: 'Attendance' },
    { href: '/admin/reports', label: 'Reports' },
  ],
  TEACHER: [
    { href: '/teacher', label: 'Dashboard' },
  ],
  STUDENT: [
    { href: '/student', label: 'Dashboard' },
  ],
  PARENT: [
    { href: '/parent', label: 'Dashboard' },
  ],
};

export function DashboardShell({
  user,
  children,
  pathname,
}: {
  user: SessionUser;
  children: React.ReactNode;
  pathname: string;
}) {
  const links = NAV[user.role] || [];

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--clay-shadow-sm)]">
        <div className="mb-8">
          <div className="font-bold text-[var(--navy)]">Fusion LMS</div>
          <div className="text-xs text-[var(--muted)]">{user.role}</div>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'bg-[var(--navy-pale)] text-[var(--navy)]'
                  : 'text-[var(--text-body)] hover:bg-[var(--navy-pale)]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-8">
          <button type="submit" className="text-sm text-[var(--red)]">Sign out</button>
        </form>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <div className="font-semibold">{user.name}</div>
          <div className="text-sm text-[var(--muted)]">{user.email}</div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
