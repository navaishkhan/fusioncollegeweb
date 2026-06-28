import { z } from 'zod';

export const teacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  qualification: z.string().optional(),
  subjectIds: z.array(z.string()).optional(),
});

export const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  fatherName: z.string().min(2),
  rollNumber: z.string().min(1),
  classId: z.string().uuid(),
  group: z.string().optional(),
  phone: z.string().optional(),
  parentEmail: z.string().email().optional(),
});

export const parentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
});

export const classSchema = z.object({
  name: z.string().min(1),
  group: z.string().optional(),
  academicYear: z.string().default('2026'),
});

export const subjectSchema = z.object({
  name: z.string().min(1),
});

export const inchargeSchema = z.object({
  classId: z.string().uuid(),
  teacherId: z.string().uuid(),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type ParentInput = z.infer<typeof parentSchema>;
export type ClassInput = z.infer<typeof classSchema>;
