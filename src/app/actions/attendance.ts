"use server";

import { revalidateWorkspacePath } from "@/lib/revalidate";


import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus, AttendanceType } from "@prisma/client";

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

export async function getAttendanceList(batchId: string, date: Date, type: AttendanceType = "THEORY") {
  try {
    // Set date to start of day to match @@unique constraint
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const students = await db.studentProfile.findMany({
      where: { batchId },
      include: {
        attendances: {
          where: { date: targetDate, type }
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

export async function getStudentsAttendance(studentIds: string[], date: Date) {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const attendances = await db.attendance.findMany({
      where: {
        studentProfileId: { in: studentIds },
        date: targetDate,
        type: "PRACTICAL"
      }
    });

    const attendanceMap: Record<string, { status: string; remarks: string | null }> = {};
    attendances.forEach(a => {
      attendanceMap[a.studentProfileId] = {
        status: a.status,
        remarks: a.remarks
      };
    });

    return { success: true, data: attendanceMap };
  } catch (error: any) {
    console.error("Error fetching students attendance:", error);
    return { success: false, error: "Failed to fetch student attendance." };
  }
}

export async function saveAttendance(
  workspaceId: string, 
  date: Date, 
  records: { studentId: string; status: AttendanceStatus; remarks?: string }[],
  type: AttendanceType = "THEORY"
) {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Use transaction to upsert all records
    await db.$transaction(
      records.map(record => 
        db.attendance.upsert({
          where: {
            studentProfileId_date_type: {
              studentProfileId: record.studentId,
              date: targetDate,
              type
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
            type,
            status: record.status,
            remarks: record.remarks || null
          }
        })
      )
    );

    // --- Automated Low Attendance Alerts ---
    const settings = await db.siteSettings.findUnique({ 
      where: { workspaceId },
      include: { workspace: true }
    });
    const config = settings?.attendanceConfig as any;
    
    if (config?.enableAlerts && config?.threshold) {
      const threshold = config.threshold;
      const absentStudentIds = records.filter(r => r.status === "ABSENT").map(r => r.studentId);
      
      if (absentStudentIds.length > 0) {
        for (const studentId of absentStudentIds) {
          const statsResult = await getStudentAttendanceStats(studentId);
          if (statsResult.success && statsResult.data) {
             const stat = type === "THEORY" ? statsResult.data.THEORY : statsResult.data.PRACTICAL;
             if (stat.totalDays > 0 && stat.percentage < threshold) {
               const profile = await db.studentProfile.findUnique({ where: { id: studentId }, select: { userId: true, fullName: true } });
               if (profile) {
                 // Send to Admin (userId is null for workspace admins)
                 await db.notification.create({
                   data: {
                     workspaceId,
                     title: "Low Attendance Alert",
                     message: `Student ${profile.fullName}'s ${type.toLowerCase()} attendance has dropped to ${stat.percentage}%.`,
                     type: "WARNING",
                     link: `/app/${settings?.workspace?.subdomain}/admin/students/${studentId}`
                   }
                 });
                 
                 // Send to Student if they have a userId
                 if (profile.userId) {
                   await db.notification.create({
                     data: {
                       workspaceId,
                       userId: profile.userId,
                       title: "Low Attendance Alert",
                       message: `Your ${type.toLowerCase()} attendance has dropped to ${stat.percentage}%. Please ensure you attend upcoming classes.`,
                       type: "WARNING",
                       link: "/student/attendance"
                     }
                   });
                 }
               }
             }
          }
        }
      }
    }
    // ----------------------------------------

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/attendance");
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
            status: true,
            type: true
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

    const calculateStats = (records: any[]) => {
      const totalDays = records.length;
      const presentDays = records.filter(a => a.status === "PRESENT").length;
      const absentDays = records.filter(a => a.status === "ABSENT").length;
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      return { totalDays, presentDays, absentDays, percentage, recentRecords: records.slice(0, 10) };
    };

    const theoryRecords = attendances.filter(a => a.type === "THEORY");
    const practicalRecords = attendances.filter(a => a.type === "PRACTICAL");

    return { 
      success: true, 
      data: {
        THEORY: calculateStats(theoryRecords),
        PRACTICAL: calculateStats(practicalRecords),
      } 
    };
  } catch (error: any) {
    console.error("Error fetching student stats:", error);
    return { success: false, error: "Failed to fetch student attendance stats." };
  }
}

export async function markAttendanceByQR(
  workspaceId: string,
  qrData: string
) {
  try {
    // 1. Identify student from QR (either studentId or enrollmentNo)
    const student = await db.studentProfile.findFirst({
      where: {
        workspaceId,
        OR: [
          { id: qrData },
          { enrollmentNo: qrData }
        ]
      },
      include: {
        batch: true,
        practicalSchedules: {
          include: { slot: true }
        }
      }
    });

    if (!student) {
      return { success: false, error: "Student not found from this QR code." };
    }

    // 2. Check timings to determine class type
    const now = new Date();
    // Format as HH:mm (Deterministic instead of relying on server locale)
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDayOfWeek = now.getDay();
    
    let determinedType: AttendanceType | null = null;
    let classNameStr = "";

    const isTimeInRange = (timeStr: string, startStr: string, endStr: string) => {
      if (!startStr || !endStr) return false;
      const [cH, cM] = timeStr.split(':').map(Number);
      const [sH, sM] = startStr.split(':').map(Number);
      const [eH, eM] = endStr.split(':').map(Number);
      
      const currentMins = cH * 60 + cM;
      const startMins = sH * 60 + sM - 30; // 30 min buffer before
      const endMins = eH * 60 + eM + 15; // 15 min buffer after

      return currentMins >= startMins && currentMins <= endMins;
    };

    // Check practical first
    const todayPractical = student.practicalSchedules.find(ps => ps.dayOfWeek === currentDayOfWeek);
    if (todayPractical && isTimeInRange(currentTimeStr, todayPractical.slot.startTime, todayPractical.slot.endTime)) {
      determinedType = "PRACTICAL";
      classNameStr = "Practical Class";
    }

    // Then check theory
    if (!determinedType && student.batch?.startTime && student.batch?.endTime) {
      if (isTimeInRange(currentTimeStr, student.batch.startTime, student.batch.endTime)) {
        determinedType = "THEORY";
        classNameStr = "Theory Class";
      }
    }

    if (!determinedType) {
      return { success: false, error: "No scheduled class found for this time." };
    }

    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);

    // 3. Mark present
    await db.attendance.upsert({
      where: {
        studentProfileId_date_type: {
          studentProfileId: student.id,
          date: targetDate,
          type: determinedType
        }
      },
      update: {
        status: "PRESENT",
      },
      create: {
        workspaceId,
        studentProfileId: student.id,
        date: targetDate,
        type: determinedType,
        status: "PRESENT",
      }
    });

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/attendance");
    
    return { 
      success: true, 
      studentName: student.fullName,
      className: classNameStr
    };

  } catch (error: any) {
    console.error("Error marking attendance via QR:", error);
    return { success: false, error: "System error marking attendance." };
  }
}
