'use server';

import { revalidatePath } from 'next/cache';
import { AttendanceStatus, SubmissionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireTeacher, requireAuth } from '@/lib/auth/session';
import { requireClassAccess, requireIncharge } from '@/lib/auth/rbac';
import { getGradeFromPercentage } from '@/lib/grades';

export async function createPost(formData: FormData): Promise<void> {
  const user = await requireTeacher();
  const classId = String(formData.get('classId'));
  if (!(await requireClassAccess(user, classId))) return;

  await prisma.post.create({
    data: {
      classId,
      authorId: user.id,
      title: String(formData.get('title')),
      description: String(formData.get('description')),
    },
  });
  revalidatePath(`/teacher/classes/${classId}`);
}

export async function createMaterial(formData: FormData): Promise<void> {
  const user = await requireTeacher();
  const classId = String(formData.get('classId'));
  if (!(await requireClassAccess(user, classId))) return;

  await prisma.material.create({
    data: {
      classId,
      title: String(formData.get('title')),
      description: formData.get('description') ? String(formData.get('description')) : null,
      fileUrl: String(formData.get('fileUrl') || '#'),
      createdById: user.id,
    },
  });
  revalidatePath(`/teacher/classes/${classId}`);
}

export async function createAssignment(formData: FormData): Promise<void> {
  const user = await requireTeacher();
  const classId = String(formData.get('classId'));
  if (!(await requireClassAccess(user, classId))) return;

  await prisma.assignment.create({
    data: {
      classId,
      title: String(formData.get('title')),
      instructions: String(formData.get('instructions')),
      deadline: new Date(String(formData.get('deadline'))),
      createdById: user.id,
    },
  });
  revalidatePath(`/teacher/classes/${classId}`);
}

export async function gradeSubmission(formData: FormData): Promise<void> {
  const user = await requireTeacher();
  const id = String(formData.get('id'));
  const grade = parseFloat(String(formData.get('grade')));
  const comment = formData.get('comment') ? String(formData.get('comment')) : null;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: true },
  });
  if (!submission || !(await requireClassAccess(user, submission.assignment.classId))) return;

  await prisma.submission.update({
    where: { id },
    data: { grade, comment, status: SubmissionStatus.GRADED },
  });
  revalidatePath(`/teacher/classes/${submission.assignment.classId}`);
}

export async function markAttendance(formData: FormData): Promise<void> {
  const user = await requireTeacher();
  const classId = String(formData.get('classId'));
  const subjectId = String(formData.get('subjectId'));
  const dateStr = String(formData.get('date'));
  const date = new Date(dateStr);

  if (!(await requireIncharge(user, classId))) return;

  const existingLock = await prisma.attendanceLock.findUnique({
    where: { classId_date: { classId, date } },
  });
  if (existingLock?.locked) return;

  const records = JSON.parse(String(formData.get('records'))) as {
    studentId: string;
    status: AttendanceStatus;
  }[];

  if (!user.teacherId) return;

  for (const record of records) {
    await prisma.attendance.upsert({
      where: {
        studentId_classId_subjectId_date: {
          studentId: record.studentId,
          classId,
          subjectId,
          date,
        },
      },
      create: {
        studentId: record.studentId,
        classId,
        subjectId,
        teacherId: user.teacherId,
        date,
        status: record.status,
      },
      update: { status: record.status },
    });

    if (record.status === AttendanceStatus.ABSENT) {
      const student = await prisma.student.findUnique({
        where: { id: record.studentId },
        include: {
          user: true,
          parentLinks: { include: { parent: { include: { user: true } } } },
        },
      });
      for (const link of student?.parentLinks || []) {
        await prisma.notification.create({
          data: {
            userId: link.parent.user.id,
            type: 'ABSENT',
            title: 'Student Absent',
            body: `${student?.user.name} marked absent on ${dateStr}`,
            metadata: { studentId: record.studentId, date: dateStr },
          },
        });
      }
    }
  }

  await prisma.attendanceLock.upsert({
    where: { classId_date: { classId, date } },
    create: { classId, date, locked: true },
    update: { locked: true, lockedAt: new Date() },
  });

  revalidatePath(`/teacher/classes/${classId}`);
}

export async function enterExamMarks(formData: FormData): Promise<void> {
  const user = await requireTeacher();
  const examId = String(formData.get('examId'));
  const studentId = String(formData.get('studentId'));
  const marksObtained = parseFloat(String(formData.get('marksObtained')));

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || !(await requireClassAccess(user, exam.classId))) return;

  const percentage = (marksObtained / exam.totalMarks) * 100;
  const grade = getGradeFromPercentage(percentage);

  await prisma.examResult.upsert({
    where: { examId_studentId: { examId, studentId } },
    create: { examId, studentId, marksObtained, percentage, grade },
    update: { marksObtained, percentage, grade },
  });
  revalidatePath(`/teacher/classes/${exam.classId}`);
}

export async function getTeacherClasses(teacherId: string) {
  const subjects = await prisma.classSubject.findMany({
    where: { teacherId },
    include: { class: true, subject: true },
  });
  const incharges = await prisma.classIncharge.findMany({
    where: { teacherId, status: 'ACTIVE' },
    include: { class: true },
  });
  const classMap = new Map<string, { id: string; name: string; isIncharge: boolean }>();
  for (const s of subjects) {
    classMap.set(s.class.id, { id: s.class.id, name: s.class.name, isIncharge: false });
  }
  for (const i of incharges) {
    classMap.set(i.class.id, { id: i.class.id, name: i.class.name, isIncharge: true });
  }
  return Array.from(classMap.values());
}

export async function getClassWorkspace(classId: string) {
  const user = await requireAuth(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']);
  if (!(await requireClassAccess(user, classId))) return null;

  const [cls, posts, materials, assignments, students, subjects, exams, attendances] =
    await Promise.all([
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.post.findMany({ where: { classId }, orderBy: { createdAt: 'desc' }, include: { author: true } }),
      prisma.material.findMany({ where: { classId }, orderBy: { createdAt: 'desc' } }),
      prisma.assignment.findMany({
        where: { classId },
        orderBy: { createdAt: 'desc' },
        include: { submissions: true },
      }),
      prisma.student.findMany({ where: { classId }, include: { user: true } }),
      prisma.classSubject.findMany({ where: { classId }, include: { subject: true, teacher: { include: { user: true } } } }),
      prisma.exam.findMany({ where: { classId }, include: { results: true, subject: true } }),
      prisma.attendance.findMany({ where: { classId }, include: { student: { include: { user: true } }, subject: true } }),
    ]);

  const isIncharge =
    user.role === 'ADMIN' ||
    (user.teacherId ? await requireIncharge(user, classId) : false);

  const lock = await prisma.attendanceLock.findFirst({
    where: { classId, date: new Date(new Date().toISOString().slice(0, 10)) },
  });

  return { cls, posts, materials, assignments, students, subjects, exams, attendances, isIncharge, locked: !!lock?.locked };
}
