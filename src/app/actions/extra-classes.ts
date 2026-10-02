"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidateWorkspacePath } from "@/lib/revalidate";

/**
 * Student requests a single-session extra practical or theory class.
 */
export async function requestExtraClass(data: {
  workspaceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type?: "PRACTICAL" | "THEORY";
  topic?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated." };
    }

    const { workspaceId, date, startTime, endTime, type = "PRACTICAL", topic } = data;

    // Find student profile in this workspace
    const student = await db.studentProfile.findFirst({
      where: {
        userId: session.user.id,
        workspaceId,
        isActive: true,
      },
      include: { course: true }
    });

    if (!student) {
      return { success: false, error: "Active student profile not found in this center." };
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check if duplicate request on same day and time
    const existing = await db.extraClassBooking.findFirst({
      where: {
        studentProfileId: student.id,
        date: bookingDate,
        startTime,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    if (existing) {
      return { success: false, error: "You already have a pending or approved extra class for this date and time." };
    }

    const booking = await db.extraClassBooking.create({
      data: {
        workspaceId,
        studentProfileId: student.id,
        courseId: student.courseId,
        batchId: student.batchId,
        date: bookingDate,
        startTime,
        endTime,
        type,
        topic: topic || null,
        status: "PENDING",
        requestedBy: "STUDENT"
      }
    });

    // Notify Franchise Admin
    await db.notification.create({
      data: {
        workspaceId,
        title: "New Extra Class Request",
        message: `${student.fullName} (${student.enrollmentNo}) requested an extra ${type.toLowerCase()} class on ${date} (${startTime} - ${endTime}).`,
        type: "ATTENDANCE",
        link: "/admin/attendance"
      }
    });

    await revalidateWorkspacePath(workspaceId, "/student/attendance", "page");
    await revalidateWorkspacePath(workspaceId, "/admin/attendance", "page");

    return { success: true, bookingId: booking.id };
  } catch (error: any) {
    console.error("Error requesting extra class:", error);
    return { success: false, error: error.message || "Failed to submit extra class request." };
  }
}

/**
 * Fetch student's own extra class bookings.
 */
export async function getStudentExtraClasses(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    const student = await db.studentProfile.findFirst({
      where: { userId: session.user.id, workspaceId }
    });

    if (!student) return { success: false, error: "Student not found" };

    const bookings = await db.extraClassBooking.findMany({
      where: { studentProfileId: student.id },
      orderBy: { date: "desc" }
    });

    return { success: true, bookings };
  } catch (error: any) {
    console.error("Error fetching student extra classes:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all extra class bookings for the Franchise Admin.
 */
export async function getWorkspaceExtraClassBookings(workspaceId: string, status?: string) {
  try {
    const where: any = { workspaceId };
    if (status && status !== "ALL") {
      where.status = status;
    }

    const bookings = await db.extraClassBooking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            enrollmentNo: true,
            phone: true,
            photoUrl: true,
            course: { select: { title: true } },
            batch: { select: { name: true } }
          }
        }
      },
      orderBy: [
        { date: "desc" },
        { startTime: "asc" }
      ]
    });

    return { success: true, bookings };
  } catch (error: any) {
    console.error("Error fetching workspace extra classes:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Franchise Admin approves or rejects a student's extra class request.
 */
export async function reviewExtraClassRequest(
  workspaceId: string,
  bookingId: string,
  action: "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  try {
    const booking = await db.extraClassBooking.findUnique({
      where: { id: bookingId, workspaceId },
      include: { student: true }
    });

    if (!booking) return { success: false, error: "Booking request not found." };

    const updated = await db.extraClassBooking.update({
      where: { id: bookingId },
      data: {
        status: action,
        rejectionReason: action === "REJECTED" ? (rejectionReason || "Slot unavailable") : null,
        approvedAt: action === "APPROVED" ? new Date() : null
      }
    });

    // Notify Student if user account linked
    if (booking.student?.userId) {
      await db.notification.create({
        data: {
          workspaceId,
          userId: booking.student.userId,
          title: `Extra Class Request ${action === "APPROVED" ? "Approved" : "Declined"}`,
          message: action === "APPROVED"
            ? `Your extra class on ${booking.date.toLocaleDateString("en-GB")} (${booking.startTime} - ${booking.endTime}) has been approved.`
            : `Your extra class request for ${booking.date.toLocaleDateString("en-GB")} was declined: ${rejectionReason || "Slot unavailable"}.`,
          type: "ATTENDANCE",
          link: "/student/attendance"
        }
      });
    }

    await revalidateWorkspacePath(workspaceId, "/admin/attendance", "page");
    await revalidateWorkspacePath(workspaceId, "/student/attendance", "page");

    return { success: true, updated };
  } catch (error: any) {
    console.error("Error reviewing extra class:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Franchise Admin directly schedules an ad-hoc extra class for an individual student.
 */
export async function adminScheduleExtraClass(data: {
  workspaceId: string;
  studentProfileId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type?: "PRACTICAL" | "THEORY";
  topic?: string;
}) {
  try {
    const { workspaceId, studentProfileId, date, startTime, endTime, type = "PRACTICAL", topic } = data;

    const student = await db.studentProfile.findUnique({
      where: { id: studentProfileId, workspaceId },
      include: { course: true }
    });

    if (!student) return { success: false, error: "Student not found in this center." };

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const booking = await db.extraClassBooking.create({
      data: {
        workspaceId,
        studentProfileId: student.id,
        courseId: student.courseId,
        batchId: student.batchId,
        date: bookingDate,
        startTime,
        endTime,
        type,
        topic: topic || "Scheduled Extra Class",
        status: "APPROVED",
        requestedBy: "ADMIN",
        approvedAt: new Date()
      }
    });

    // Notify Student
    if (student.userId) {
      await db.notification.create({
        data: {
          workspaceId,
          userId: student.userId,
          title: "New Extra Class Scheduled",
          message: `Your center has scheduled an extra ${type.toLowerCase()} class for you on ${date} (${startTime} - ${endTime}).`,
          type: "ATTENDANCE",
          link: "/student/attendance"
        }
      });
    }

    await revalidateWorkspacePath(workspaceId, "/admin/attendance", "page");
    await revalidateWorkspacePath(workspaceId, "/student/attendance", "page");

    return { success: true, bookingId: booking.id };
  } catch (error: any) {
    console.error("Error scheduling extra class:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark attendance for an Extra Class booking.
 * Automatically synchronizes with the main Attendance table so it contributes to total attendance.
 */
export async function markExtraClassAttendance(
  workspaceId: string,
  bookingId: string,
  attendanceStatus: "PRESENT" | "ABSENT",
  remarks?: string
) {
  try {
    const booking = await db.extraClassBooking.findUnique({
      where: { id: bookingId, workspaceId },
      include: { student: true }
    });

    if (!booking) return { success: false, error: "Extra class booking not found." };

    // Update the booking record
    await db.extraClassBooking.update({
      where: { id: bookingId },
      data: {
        attendanceMarked: true,
        attendanceStatus,
        remarks: remarks || null,
        status: "COMPLETED"
      }
    });

    // If marked PRESENT, upsert into the Attendance table so the session is credited!
    if (attendanceStatus === "PRESENT") {
      const attendanceDate = new Date(booking.date);
      attendanceDate.setHours(0, 0, 0, 0);

      await db.attendance.upsert({
        where: {
          studentProfileId_date_type: {
            studentProfileId: booking.studentProfileId,
            date: attendanceDate,
            type: booking.type
          }
        },
        create: {
          workspaceId,
          studentProfileId: booking.studentProfileId,
          date: attendanceDate,
          status: "PRESENT",
          type: booking.type,
          remarks: `Extra Class: ${booking.topic || "Practical session"}`
        },
        update: {
          status: "PRESENT",
          remarks: `Extra Class: ${booking.topic || "Practical session"}`
        }
      });
    }

    await revalidateWorkspacePath(workspaceId, "/admin/attendance", "page");
    await revalidateWorkspacePath(workspaceId, "/student/attendance", "page");

    return { success: true };
  } catch (error: any) {
    console.error("Error marking extra class attendance:", error);
    return { success: false, error: error.message };
  }
}
