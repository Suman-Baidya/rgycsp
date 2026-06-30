"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

export async function getBatches(workspaceId: string) {
  try {
    const batches = await db.batch.findMany({
      where: { workspaceId },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: batches };
  } catch (error: any) {
    console.error("Error fetching batches:", error);
    return { success: false, error: "Failed to fetch batches." };
  }
}

export async function getAttendanceList(batchId: string, date: Date) {
  try {
    // Set date to start of day to match @@unique constraint
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const students = await db.studentProfile.findMany({
      where: { batchId },
      include: {
        attendances: {
          where: { date: targetDate }
        }
      },
      orderBy: { fullName: "asc" }
    });

    const formattedData = students.map(student => ({
      studentId: student.id,
      fullName: student.fullName,
      enrollmentNo: student.enrollmentNo,
      status: student.attendances[0]?.status || null,
      remarks: student.attendances[0]?.remarks || ""
    }));

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error("Error fetching attendance list:", error);
    return { success: false, error: "Failed to fetch student list." };
  }
}

export async function saveAttendance(
  workspaceId: string, 
  date: Date, 
  records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
) {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Use transaction to upsert all records
    await db.$transaction(
      records.map(record => 
        db.attendance.upsert({
          where: {
            studentProfileId_date: {
              studentProfileId: record.studentId,
              date: targetDate
            }
          },
          update: {
            status: record.status,
            remarks: record.remarks || null
          },
          create: {
            workspaceId,
            studentProfileId: record.studentId,
            date: targetDate,
            status: record.status,
            remarks: record.remarks || null
          }
        })
      )
    );

    revalidatePath("/app/[tenant]/admin/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving attendance:", error);
    return { success: false, error: "Failed to save attendance records." };
  }
}

export async function getBatchAttendanceReport(batchId: string, duration: "LAST_MONTH" | "LAST_6_MONTHS" | "FULL_COURSE") {
  try {
    let startDate: Date | undefined;
    
    if (duration === "LAST_MONTH") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (duration === "LAST_6_MONTHS") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    }
    
    const dateFilter = startDate ? { gte: startDate } : undefined;

    const students = await db.studentProfile.findMany({
      where: { batchId },
      select: {
        id: true,
        fullName: true,
        enrollmentNo: true,
        attendances: {
          where: dateFilter ? { date: dateFilter } : undefined,
          select: {
            date: true,
            status: true
          }
        }
      },
      orderBy: { fullName: "asc" }
    });

    return { success: true, data: students };
  } catch (error: any) {
    console.error("Error fetching batch report:", error);
    return { success: false, error: "Failed to fetch batch attendance report." };
  }
}

export async function getStudentAttendanceStats(studentId: string) {
  try {
    const attendances = await db.attendance.findMany({
      where: { studentProfileId: studentId },
      orderBy: { date: "desc" }
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === "PRESENT").length;
    const absentDays = attendances.filter(a => a.status === "ABSENT").length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return { 
      success: true, 
      data: {
        totalDays,
        presentDays,
        absentDays,
        percentage,
        recentRecords: attendances.slice(0, 10)
      } 
    };
  } catch (error: any) {
    console.error("Error fetching student stats:", error);
    return { success: false, error: "Failed to fetch student attendance stats." };
  }
}
