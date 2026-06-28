export { calculateGrade, calculatePercentage } from '@/lib/utils';

export const GRADE_SCALE = [
  { min: 90, grade: 'A+' },
  { min: 80, grade: 'A' },
  { min: 70, grade: 'B' },
  { min: 60, grade: 'C' },
  { min: 50, grade: 'D' },
  { min: 0, grade: 'F' },
] as const;

export function getGradeFromPercentage(percentage: number): string {
  for (const { min, grade } of GRADE_SCALE) {
    if (percentage >= min) return grade;
  }
  return 'F';
}

export function getAttendancePercentage(present: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((present / total) * 10000) / 100;
}
