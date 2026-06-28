'use server';

import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { ROLE_HOME } from '@/lib/utils';
import { loginSchema, createUserSchema } from '@/lib/validations/auth';

type CreateUserResult = { ok: true; userId: string; email: string } | { ok: false; error: string };

export async function createUserInternal(formData: FormData): Promise<CreateUserResult> {
  const parsed = createUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    password: formData.get('password') || undefined,
    phone: formData.get('phone') || undefined,
  });
  if (!parsed.success) return { ok: false, error: 'Invalid data' };

  const { name, email, role, password, phone } = parsed.data;
  const tempPassword = password || `Fusion@${Math.random().toString(36).slice(2, 10)}`;

  const supabase = await createServiceClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });
  if (error || !data.user) return { ok: false, error: error?.message || 'Auth creation failed' };

  const user = await prisma.user.create({
    data: { authId: data.user.id, name, email, role: role as Role },
  });

  if (role === 'TEACHER') {
    await prisma.teacher.create({ data: { userId: user.id, phone } });
  } else if (role === 'PARENT') {
    await prisma.parent.create({ data: { userId: user.id, phone } });
  }

  return { ok: true, userId: user.id, email };
}

export async function signIn(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) redirect('/login?error=invalid');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=failed');

  const profile = await prisma.user.findUnique({ where: { authId: user.id } });
  if (!profile || profile.status !== 'ACTIVE') {
    await supabase.auth.signOut();
    redirect('/login?error=inactive');
  }

  redirect(ROLE_HOME[profile.role] || '/login');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = String(formData.get('email') || '');
  if (!email) redirect('/reset-password?error=email');

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect('/reset-password?sent=1');
}

export async function createUser(formData: FormData): Promise<void> {
  const result = await createUserInternal(formData);
  if (!result.ok) redirect('/admin?error=' + encodeURIComponent(result.error));
  revalidatePath('/admin');
}

export async function disableUser(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { status: 'INACTIVE' } });
  revalidatePath('/admin');
}
