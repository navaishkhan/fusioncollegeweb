import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams, pathname } = new URL(request.url);
  const type = pathname.split('/').at(-2);

  let rows: Record<string, unknown>[] = [];

  if (type === 'attendance') {
    const records = await prisma.attendance.findMany({
      include: { student: { include: { user: true } }, class: true, subject: true },
      where: searchParams.get('classId') ? { classId: searchParams.get('classId')! } : undefined,
    });
    rows = records.map((r) => ({
      Student: r.student.user.name,
      Class: r.class.name,
      Subject: r.subject.name,
      Date: r.date.toISOString().slice(0, 10),
      Status: r.status,
    }));
  } else if (type === 'performance') {
    const results = await prisma.examResult.findMany({
      include: { exam: { include: { class: true, subject: true } }, student: { include: { user: true } } },
    });
    rows = results.map((r) => ({
      Student: r.student.user.name,
      Exam: r.exam.name,
      Class: r.exam.class.name,
      Subject: r.exam.subject.name,
      Marks: r.marksObtained,
      Percentage: r.percentage,
      Grade: r.grade,
    }));
  } else if (type === 'student') {
    const students = await prisma.student.findMany({
      include: { user: true, class: true, examResults: true, attendances: true },
    });
    rows = students.map((s) => ({
      Name: s.user.name,
      Roll: s.rollNumber,
      Class: s.class.name,
      AttendanceRecords: s.attendances.length,
      Tests: s.examResults.length,
    }));
  } else if (type === 'teacher') {
    const teachers = await prisma.teacher.findMany({
      include: { user: true, classSubjects: true, attendances: true, exams: true },
    });
    rows = teachers.map((t) => ({
      Name: t.user.name,
      Classes: t.classSubjects.length,
      AttendanceMarked: t.attendances.length,
      Exams: t.exams.length,
    }));
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${type}-report.xlsx"`,
    },
  });
}
