'use server';

import { revalidatePath } from 'next/cache';
import { AttendanceStatus, InchargeStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';
import { createUserInternal } from '@/actions/auth.actions';
import { getGradeFromPercentage } from '@/lib/grades';

export async function getAdminStats() {
  await requireAdmin();
  const [students, teachers, classes, subjects] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.subject.count(),
  ]);
  return { students, teachers, classes, subjects };
}

export async function createClass(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name'));
  const group = formData.get('group') ? String(formData.get('group')) : null;
  const academicYear = String(formData.get('academicYear') || '2026');
  await prisma.class.create({ data: { name, group, academicYear } });
  revalidatePath('/admin/classes');
}

export async function createSubject(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name'));
  await prisma.subject.create({ data: { name } });
  revalidatePath('/admin/subjects');
}

export async function createStudent(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userResult = await createUserInternal(formData);
  if (!userResult.ok) return;

  const profile = await prisma.user.findUnique({ where: { id: userResult.userId } });
  if (!profile) return;

  await prisma.student.create({
    data: {
      userId: profile.id,
      fatherName: String(formData.get('fatherName') || ''),
      rollNumber: String(formData.get('rollNumber') || ''),
      classId: String(formData.get('classId') || ''),
      group: formData.get('group') ? String(formData.get('group')) : null,
      phone: formData.get('phone') ? String(formData.get('phone')) : null,
    },
  });

  await prisma.auditLog.create({
    data: { userId: admin.id, action: 'CREATE', entity: 'Student', entityId: profile.id },
  });
  revalidatePath('/admin/students');
}

export async function assignIncharge(formData: FormData) {
  const admin = await requireAdmin();
  const classId = String(formData.get('classId'));
  const teacherId = String(formData.get('teacherId'));

  await prisma.classIncharge.updateMany({
    where: { classId, status: InchargeStatus.ACTIVE },
    data: { status: InchargeStatus.REMOVED },
  });

  await prisma.classIncharge.create({
    data: { classId, teacherId, assignedByAdmin: admin.id },
  });
  revalidatePath('/admin/incharges');
}

export async function assignClassSubject(formData: FormData) {
  await requireAdmin();
  const classId = String(formData.get('classId'));
  const subjectId = String(formData.get('subjectId'));
  const teacherId = formData.get('teacherId') ? String(formData.get('teacherId')) : null;

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId, subjectId } },
    create: { classId, subjectId, teacherId },
    update: { teacherId },
  });
  revalidatePath('/admin/classes');
}

export async function createTestSession(formData: FormData) {
  await requireAdmin();
  await prisma.testSession.create({
    data: {
      name: String(formData.get('name')),
      startDate: new Date(String(formData.get('startDate'))),
      endDate: new Date(String(formData.get('endDate'))),
      instructions: formData.get('instructions') ? String(formData.get('instructions')) : null,
    },
  });
  revalidatePath('/admin/test-sessions');
}

export async function createExam(formData: FormData) {
  await requireAdmin();
  await prisma.exam.create({
    data: {
      name: String(formData.get('name')),
      sessionId: formData.get('sessionId') ? String(formData.get('sessionId')) : null,
      subjectId: String(formData.get('subjectId')),
      classId: String(formData.get('classId')),
      date: new Date(String(formData.get('date'))),
      totalMarks: parseFloat(String(formData.get('totalMarks') || '100')),
      duration: formData.get('duration') ? parseInt(String(formData.get('duration')), 10) : null,
      teacherId: formData.get('teacherId') ? String(formData.get('teacherId')) : null,
    },
  });
  revalidatePath('/admin/exams');
}

export async function unlockAttendance(classId: string, date: string) {
  const admin = await requireAdmin();
  await prisma.attendanceLock.deleteMany({
    where: { classId, date: new Date(date) },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'UNLOCK_ATTENDANCE',
      entity: 'AttendanceLock',
      entityId: classId,
      details: { date },
    },
  });
  revalidatePath('/admin/attendance');
}

export async function linkParentStudent(formData: FormData) {
  await requireAdmin();
  const parentId = String(formData.get('parentId'));
  const studentId = String(formData.get('studentId'));
  await prisma.parentStudent.create({ data: { parentId, studentId } });
  revalidatePath('/admin/parents');
}

export async function enterExamResult(formData: FormData) {
  await requireAdmin();
  const examId = String(formData.get('examId'));
  const studentId = String(formData.get('studentId'));
  const marksObtained = parseFloat(String(formData.get('marksObtained')));
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return { error: 'Exam not found' };
  const percentage = (marksObtained / exam.totalMarks) * 100;
  const grade = getGradeFromPercentage(percentage);

  await prisma.examResult.upsert({
    where: { examId_studentId: { examId, studentId } },
    create: { examId, studentId, marksObtained, percentage, grade },
    update: { marksObtained, percentage, grade },
  });
  revalidatePath('/admin/exams');
}

export async function overrideAttendance(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as AttendanceStatus;
  await prisma.attendance.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({
    data: { userId: admin.id, action: 'OVERRIDE', entity: 'Attendance', entityId: id, details: { status } },
  });
  revalidatePath('/admin/attendance');
}
