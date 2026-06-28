'use server';

import { prisma } from '@/lib/prisma';

export async function submitContactEnquiry(formData: FormData): Promise<void> {
  const name = String(formData.get('name') || '');
  const phone = String(formData.get('phone') || '');
  const email = formData.get('email') ? String(formData.get('email')) : null;
  const message = formData.get('message') ? String(formData.get('message')) : null;

  if (!name || !phone) return;

  await prisma.contactEnquiry.create({
    data: { name, phone, email, message },
  });
}
