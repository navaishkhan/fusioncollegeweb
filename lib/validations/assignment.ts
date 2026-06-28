import { z } from 'zod';

export const postSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const materialSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url(),
});

export const assignmentSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1),
  instructions: z.string().min(1),
  deadline: z.string(),
});

export const submissionSchema = z.object({
  assignmentId: z.string().uuid(),
  fileUrl: z.string().url().optional(),
});

export const gradeSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  grade: z.number().min(0),
  comment: z.string().optional(),
});
