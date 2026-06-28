import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});
