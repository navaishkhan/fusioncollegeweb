'use server';

import { unlockAttendance } from '@/actions/admin.actions';

export async function unlockAttendanceForm(formData: FormData) {
  const classId = String(formData.get('classId'));
  const date = String(formData.get('date'));
  await unlockAttendance(classId, date);
}
