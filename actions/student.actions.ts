'use server';

import { revalidatePath } from 'next/cache';
import { SubmissionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireStudent } from '@/lib/auth/session';

export async function submitAssignment(formData: FormData): Promise<void> {
  const user = await requireStudent();
  if (!user.studentId) return;

  const assignmentId = String(formData.get('assignmentId'));
  const fileUrl = String(formData.get('fileUrl') || '#');

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return;

  const isLate = new Date() > assignment.deadline;

  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: user.studentId } },
    create: {
      assignmentId,
      studentId: user.studentId,
      fileUrl,
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    },
    update: {
      fileUrl,
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  });

  revalidatePath(`/student/classes/${assignment.classId}`);
}

export async function getStudentDashboard(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: true,
      user: true,
      attendances: true,
      examResults: { include: { exam: true } },
      submissions: { include: { assignment: true } },
    },
  });
  return student;
}
