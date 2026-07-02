import { createClient } from '@/utils/supabase/server';
import prisma from '@/utils/db';
import whatsappService from '@/utils/whatsapp/service';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lectureId, sendOnlyAbsent = false } = body;

    // Verify user is a teacher
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: { teacher: true },
    });

    if (!dbUser || dbUser.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch lecture with attendance records
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        classSubject: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          },
        },
        attendance: {
          include: {
            student: {
              include: {
                class: true,
                user: true,
              },
            },
          },
        },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Verify teacher is assigned to this class
    if (lecture.classSubject.teacherId !== dbUser.teacher.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Filter attendance based on sendOnlyAbsent flag
    const attendanceToSend = sendOnlyAbsent
      ? lecture.attendance.filter(a => a.status === 'ABSENT')
      : lecture.attendance;

    const results = [];
    const errors = [];

    for (const attendance of attendanceToSend) {
      const student = attendance.student;
      
      if (!student.phone) {
        errors.push({
          studentId: student.id,
          studentName: student.name,
          error: 'No phone number provided',
        });
        continue;
      }

      try {
        // Check if notification already sent
        const existingNotification = await prisma.attendanceNotification.findUnique({
          where: {
            studentId_lectureId: {
              studentId: student.id,
              lectureId: lecture.id,
            },
          },
        });

        if (existingNotification && existingNotification.status === 'SENT') {
          results.push({
            studentId: student.id,
            studentName: student.name,
            status: 'already_sent',
          });
          continue;
        }

        // Send WhatsApp message
        await whatsappService.sendAttendanceNotification(
          student.phone,
          student.name,
          student.rollNumber,
          student.class.name,
          attendance.status
        );

        // Create or update notification record
        await prisma.attendanceNotification.upsert({
          where: {
            studentId_lectureId: {
              studentId: student.id,
              lectureId: lecture.id,
            },
          },
          update: {
            status: 'SENT',
            sentAt: new Date(),
            errorMessage: null,
          },
          create: {
            studentId: student.id,
            lectureId: lecture.id,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        results.push({
          studentId: student.id,
          studentName: student.name,
          status: 'sent',
        });
      } catch (error) {
        // Record failed notification
        await prisma.attendanceNotification.upsert({
          where: {
            studentId_lectureId: {
              studentId: student.id,
              lectureId: lecture.id,
            },
          },
          update: {
            status: 'FAILED',
            errorMessage: error.message,
          },
          create: {
            studentId: student.id,
            lectureId: lecture.id,
            status: 'FAILED',
            errorMessage: error.message,
          },
        });

        errors.push({
          studentId: student.id,
          studentName: student.name,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: attendanceToSend.length,
      sent: results.filter(r => r.status === 'sent').length,
      alreadySent: results.filter(r => r.status === 'already_sent').length,
      errors: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error sending attendance notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');

    if (!lectureId) {
      return NextResponse.json({ error: 'Lecture ID required' }, { status: 400 });
    }

    // Verify user is a teacher
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: { teacher: true },
    });

    if (!dbUser || dbUser.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch notification history
    const notifications = await prisma.attendanceNotification.findMany({
      where: { lectureId },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching attendance notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
