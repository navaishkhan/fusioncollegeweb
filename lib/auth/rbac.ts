import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { SessionUser } from '@/lib/auth/session';

export async function isClassIncharge(teacherId: string, classId: string) {
  const incharge = await prisma.classIncharge.findFirst({
    where: { teacherId, classId, status: 'ACTIVE' },
  });
  return !!incharge;
}

export async function requireClassAccess(user: SessionUser, classId: string) {
  if (user.role === Role.ADMIN) return true;

  if (user.role === Role.TEACHER && user.teacherId) {
    const assigned = await prisma.classSubject.findFirst({
      where: { classId, teacherId: user.teacherId },
    });
    const incharge = await prisma.classIncharge.findFirst({
      where: { classId, teacherId: user.teacherId, status: 'ACTIVE' },
    });
    return !!(assigned || incharge);
  }

  if (user.role === Role.STUDENT && user.studentId) {
    const student = await prisma.student.findFirst({
      where: { id: user.studentId, classId },
    });
    return !!student;
  }

  if (user.role === Role.PARENT && user.parentId) {
    const link = await prisma.parentStudent.findFirst({
      where: { parentId: user.parentId, student: { classId } },
    });
    return !!link;
  }

  return false;
}

export async function requireIncharge(user: SessionUser, classId: string) {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.TEACHER && user.teacherId) {
    return isClassIncharge(user.teacherId, classId);
  }
  return false;
}
