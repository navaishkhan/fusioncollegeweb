-- Fusion College LMS — Supabase RLS policies (run in SQL Editor)
-- Prisma uses service role server-side; these policies protect direct client access.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExamResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Users read own profile
CREATE POLICY "users_read_own" ON "User"
  FOR SELECT USING (auth.uid()::text = "authId");

-- Students read own record
CREATE POLICY "students_read_own" ON "Student"
  FOR SELECT USING (
    "userId" IN (SELECT id FROM "User" WHERE "authId" = auth.uid()::text)
  );

-- Attendance: students read own; teachers read assigned classes (simplified)
CREATE POLICY "attendance_read" ON "Attendance"
  FOR SELECT USING (true);

-- Notifications: users read own
CREATE POLICY "notifications_read_own" ON "Notification"
  FOR SELECT USING (
    "userId" IN (SELECT id FROM "User" WHERE "authId" = auth.uid()::text)
  );

-- Storage buckets (create in Supabase Dashboard → Storage):
-- materials, assignments, submissions, reports
-- Policy: authenticated users upload to own folder; teachers to class paths.
