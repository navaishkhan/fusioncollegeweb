import { Role, UserStatus } from '@prisma/client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ROLE_HOME } from '@/lib/utils';

export type SessionUser = {
  id: string;
  authId: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  profileImage: string | null;
  teacherId?: string;
  studentId?: string;
  parentId?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.user.findUnique({
    where: { authId: user.id },
    include: {
      teacher: { select: { id: true } },
      student: { select: { id: true } },
      parent: { select: { id: true } },
    },
  });

  if (!profile || profile.status !== UserStatus.ACTIVE) return null;

  return {
    id: profile.id,
    authId: profile.authId,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    profileImage: profile.profileImage,
    teacherId: profile.teacher?.id,
    studentId: profile.student?.id,
    parentId: profile.parent?.id,
  };
}

export async function requireAuth(allowedRoles?: Role[]) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(ROLE_HOME[user.role] || '/login');
  }
  return user;
}

export async function requireRole(roles: Role[]) {
  return requireAuth(roles);
}

export async function requireAdmin() {
  return requireAuth([Role.ADMIN]);
}

export async function requireTeacher() {
  return requireAuth([Role.TEACHER]);
}

export async function requireStudent() {
  return requireAuth([Role.STUDENT]);
}

export async function requireParent() {
  return requireAuth([Role.PARENT]);
}
