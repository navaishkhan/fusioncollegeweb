import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const markAttendanceSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  date: z.string(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.nativeEnum(AttendanceStatus),
    })
  ),
});

export const attendanceOverrideSchema = z.object({
  attendanceId: z.string().uuid(),
  status: z.nativeEnum(AttendanceStatus),
});

export const unlockAttendanceSchema = z.object({
  classId: z.string().uuid(),
  date: z.string(),
});
