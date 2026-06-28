-- Fusion College LMS - Database Schema
-- Run this in Supabase SQL Editor

-- Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE');
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'LATE');
CREATE TYPE "InchargeStatus" AS ENUM ('ACTIVE', 'REMOVED');
CREATE TYPE "ExamStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "NotificationType" AS ENUM ('ABSENT', 'ASSIGNMENT', 'TEST', 'LOW_ATTENDANCE', 'GENERAL');

-- Tables (in correct order to avoid foreign key errors)
CREATE TABLE "Subject" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT UNIQUE NOT NULL
);

CREATE TABLE "Class" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "group" TEXT,
    "academicYear" TEXT DEFAULT '2026',
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "authId" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "role" "Role" NOT NULL,
    "profileImage" TEXT,
    "status" "UserStatus" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Teacher" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "phone" TEXT,
    "qualification" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Student" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "fatherName" TEXT NOT NULL,
    "rollNumber" TEXT UNIQUE NOT NULL,
    "classId" UUID NOT NULL,
    "group" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("classId") REFERENCES "Class"("id")
);

CREATE TABLE "Parent" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "ParentStudent" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "parentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE,
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE,
    UNIQUE ("parentId", "studentId")
);

CREATE TABLE "TeacherSubject" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE,
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE,
    UNIQUE ("teacherId", "subjectId")
);

CREATE TABLE "ClassSubject" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "teacherId" UUID,
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id"),
    UNIQUE ("classId", "subjectId")
);

CREATE TABLE "ClassIncharge" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "assignedByAdmin" UUID NOT NULL,
    "assignedDate" TIMESTAMP DEFAULT NOW(),
    "status" "InchargeStatus" DEFAULT 'ACTIVE',
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE,
    FOREIGN KEY ("assignedByAdmin") REFERENCES "User"("id"),
    UNIQUE ("classId", "teacherId")
);

CREATE TABLE "Post" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
);

CREATE TABLE "Material" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
);

CREATE TABLE "Assignment" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "deadline" TIMESTAMP NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
);

CREATE TABLE "Submission" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "assignmentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "fileUrl" TEXT,
    "grade" NUMERIC,
    "comment" TEXT,
    "status" "SubmissionStatus" DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP,
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE,
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE,
    UNIQUE ("assignmentId", "studentId")
);

CREATE TABLE "Lecture" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "number" INTEGER NOT NULL,
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE,
    UNIQUE ("classId", "subjectId", "date", "number")
);

CREATE TABLE "AttendanceLock" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "locked" BOOLEAN DEFAULT true,
    "lockedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    UNIQUE ("classId", "date")
);

CREATE TABLE "Attendance" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "lectureId" UUID,
    "teacherId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE,
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id"),
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id"),
    UNIQUE ("studentId", "classId", "subjectId", "date")
);

CREATE TABLE "TestSession" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "instructions" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Exam" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionId" UUID,
    "name" TEXT NOT NULL,
    "subjectId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalMarks" NUMERIC NOT NULL,
    "duration" INTEGER,
    "teacherId" UUID,
    "status" "ExamStatus" DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id"),
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id"),
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE,
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id")
);

CREATE TABLE "ExamResult" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "examId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "marksObtained" NUMERIC NOT NULL,
    "percentage" NUMERIC NOT NULL,
    "grade" TEXT NOT NULL,
    FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE,
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE,
    UNIQUE ("examId", "studentId")
);

CREATE TABLE "Notification" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "AuditLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE TABLE "ContactEnquiry" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "program" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX "User_authId_idx" ON "User"("authId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Student_classId_idx" ON "Student"("classId");
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_read_idx" ON "Notification"("read");
CREATE INDEX "Exam_examId_idx" ON "ExamResult"("examId");
CREATE INDEX "Exam_studentId_idx" ON "ExamResult"("studentId");
