'use server';

import { prisma } from '@/lib/prisma';
import { requireParent } from '@/lib/auth/session';
import { getAttendancePercentage } from '@/lib/grades';

export async function getParentDashboard(parentId: string) {
  const links = await prisma.parentStudent.findMany({
    where: { parentId },
    include: {
      student: {
        include: {
          user: true,
          class: true,
          attendances: true,
          examResults: { include: { exam: true } },
          submissions: { include: { assignment: true } },
        },
      },
    },
  });

  return links.map((link) => {
    const total = link.student.attendances.length;
    const present = link.student.attendances.filter((a) => a.status === 'PRESENT').length;
    return {
      ...link.student,
      attendancePct: getAttendancePercentage(present, total),
    };
  });
}

export async function getParentChildren() {
  const user = await requireParent();
  if (!user.parentId) return [];
  return getParentDashboard(user.parentId);
}

export async function getParentNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}
