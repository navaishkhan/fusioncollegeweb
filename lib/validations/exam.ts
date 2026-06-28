import { z } from 'zod';
import { ExamStatus } from '@prisma/client';

export const testSessionSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  instructions: z.string().optional(),
});

export const examSchema = z.object({
  sessionId: z.string().uuid().optional(),
  name: z.string().min(1),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  date: z.string(),
  totalMarks: z.number().positive(),
  duration: z.number().optional(),
  teacherId: z.string().uuid().optional(),
  status: z.nativeEnum(ExamStatus).optional(),
});

export const examResultSchema = z.object({
  examId: z.string().uuid(),
  studentId: z.string().uuid(),
  marksObtained: z.number().min(0),
});
