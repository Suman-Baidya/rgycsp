"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDocumentStatus } from "@/lib/document-utils";
import { cookies } from "next/headers";

export async function getStudentProfile(workspaceId: string, overrideProfileId?: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const cookieStore = await cookies();
    const impersonatedId = cookieStore.get("impersonated_profile_id")?.value;
    const effectiveProfileId = impersonatedId || overrideProfileId;

    let targetUserId = session.user.id;

    if (effectiveProfileId) {
      const isGlobalAdmin = session.user.role === "SUPER_ADMIN" || 
                            session.user.role === "SUPER_ADMIN_MANAGER" || 
                            session.user.email === process.env.DEVELOPER_EMAIL;
      
      let isFranchiseAdmin = false;
      if (!isGlobalAdmin) {
        const role = await db.workspaceRole.findFirst({
          where: { workspaceId, userId: session.user.id }
        });
        isFranchiseAdmin = role?.role === "ADMIN" || role?.role === "MANAGER" || role?.role === "TEACHER";
      }

      if (!isGlobalAdmin && !isFranchiseAdmin) {
        return { success: false, error: "Unauthorized to view other students." };
      }

      const targetStudent = await db.studentProfile.findUnique({
        where: { id: effectiveProfileId },
        select: { userId: true, workspaceId: true }
      });

      if (!targetStudent || targetStudent.workspaceId !== workspaceId || !targetStudent.userId) {
         return { success: false, error: "Student not found." };
      }
      
      targetUserId = targetStudent.userId;
    }

    const user = await db.user.findUnique({
      where: { id: targetUserId },
      include: {
        workspaceRoles: {
          where: { workspaceId }
        },
        studentProfile: {
          include: {
            invoices: {
              orderBy: { createdAt: 'desc' }
            },
            batch: {
              include: {
                course: true
              }
            },
            attendances: {
              orderBy: { date: 'desc' },
              take: 5
            },
            admissionApp: true,
            semesters: {
              include: {
                marks: true
              }
            },
            practicalSchedules: {
              include: {
                slot: true
              }
            }
          }
        }
      }
    });

    if (!user) return { success: false, error: "User not found" };

    const isStudent = user.workspaceRoles.some(r => r.role === "STUDENT");
    if (!isStudent) {
      return { success: false, error: "Access denied. Not a student of this workspace." };
    }

    if (user.studentProfile && !user.studentProfile.isActive) {
      return { success: false, error: "Your account is temporarily paused. Please contact your center admin." };
    }

    return { success: true, data: user };
  } catch (error: any) {
    console.error("Error fetching student profile:", error);
    return { success: false, error: "Failed to fetch profile." };
  }
}

export async function getWorkspaceRole(workspaceId: string, userId: string) {
  try {
    const role = await db.workspaceRole.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId
        }
      }
    });
    return role?.role || null;
  } catch (error) {
    console.error("Error fetching workspace role:", error);
    return null;
  }
}

export async function getStudentDashboardData(workspaceId: string, studentProfileId: string, courseId?: string | null) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const isGlobalAdmin = session.user.role === "SUPER_ADMIN" || 
                          session.user.role === "SUPER_ADMIN_MANAGER" || 
                          session.user.email === process.env.DEVELOPER_EMAIL;
    
    let isFranchiseAdmin = false;
    if (!isGlobalAdmin) {
      const role = await db.workspaceRole.findFirst({
        where: { workspaceId, userId: session.user.id }
      });
      isFranchiseAdmin = role?.role === "ADMIN" || role?.role === "MANAGER" || role?.role === "TEACHER";
    }

    const studentProfile = await db.studentProfile.findUnique({
       where: { id: studentProfileId },
       select: { userId: true }
    });

    if (!isGlobalAdmin && !isFranchiseAdmin && studentProfile?.userId !== session.user.id) {
       return { success: false, error: "Unauthorized access to dashboard data." };
    }

    // 1. Fetch Invoices for Balance
    const invoices = await db.invoice.findMany({
      where: { studentProfileId, workspaceId },
      select: { amount: true, status: true }
    });

    const remainingBalance = invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + inv.amount, 0);

    // 2. Fetch Attendance
    const attendances = await db.attendance.findMany({
      where: { studentProfileId, workspaceId },
      select: { status: true }
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100; // default 100 if no records

    // 3. Fetch Upcoming Exams
    let upcomingExams: any[] = [];
    if (courseId) {
      upcomingExams = await db.exam.findMany({
        where: {
          workspaceId,
          courseId,
          date: { gte: new Date() }
        },
        orderBy: { date: 'asc' },
        take: 3,
        select: { id: true, title: true, date: true, type: true }
      });
    }

    // 4. Fetch Student Profile for Document Approvals
    const profile = await db.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: {
        id: true,
        admitCardIssuedToStudent: true,
        registrationCardIssuedToStudent: true,
        certificateIssuedToStudent: true,
        certificateApproved: true,
        semesters: true
      }
    });

    const config = await db.registrationConfig.findFirst();

    const issuedDocuments = [];
    if (profile) {
      if (profile.admitCardIssuedToStudent) issuedDocuments.push({ name: 'Admit Card', type: 'DOCUMENT' });
      if (profile.registrationCardIssuedToStudent) issuedDocuments.push({ name: 'Registration Card', type: 'DOCUMENT' });
      
      const { isCertAuto, finalCertIssued } = getDocumentStatus(profile, null, config);
      if (finalCertIssued) {
        issuedDocuments.push({ name: 'Course Certificate', type: 'DOCUMENT' });
      }

      const issuedMarksheets = profile.semesters?.filter((sem: any) => {
        const { finalMarksheetIssued } = getDocumentStatus(profile, sem, config);
        return finalMarksheetIssued;
      }) || [];
      
      issuedMarksheets.forEach((sem: any) => {
        issuedDocuments.push({ name: `Semester ${sem.semesterNumber} Marksheet`, type: 'DOCUMENT' });
      });
    }

    return {
      success: true,
      data: {
        remainingBalance,
        attendancePercentage,
        upcomingExams,
        issuedDocuments
      }
    };
  } catch (error: any) {
    console.error("Error fetching student dashboard data:", error);
    return { success: false, error: "Failed to fetch dashboard data." };
  }
}

