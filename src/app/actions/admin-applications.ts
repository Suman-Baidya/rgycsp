"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdmissionApplications(workspaceId: string) {
  try {
    const apps = await db.admissionApplication.findMany({
      where: { workspaceId },
      include: {
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: apps };
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return { success: false, error: "Failed to fetch applications." };
  }
}

export async function getApplicationDetails(applicationId: string) {
  try {
    const app = await db.admissionApplication.findUnique({
      where: { id: applicationId },
      include: {
        course: { select: { title: true } }
      }
    });
    return { success: true, data: app };
  } catch (error: any) {
    console.error("Error fetching application details:", error);
    return { success: false, error: "Failed to fetch application details." };
  }
}

export async function approveApplication(applicationId: string, batchId: string) {
  try {
    const application = await db.admissionApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    if (application.status === "APPROVED") {
      return { success: false, error: "Already approved." };
    }

    // Wrap in transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Update application status
      const updatedApp = await tx.admissionApplication.update({
        where: { id: applicationId },
        data: { status: "APPROVED" }
      });

      // 2. Generate Enrollment No (Simple fallback logic)
      const count = await tx.studentProfile.count({
        where: { workspaceId: application.workspaceId }
      });
      const enrollmentNo = `ENR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      // 3. Create StudentProfile
      const student = await tx.studentProfile.create({
        data: {
          workspaceId: application.workspaceId,
          batchId: batchId || null,
          fullName: application.fullName,
          enrollmentNo: enrollmentNo,
          dob: application.dob,
          gender: application.gender,
          phone: application.mobile,
          parentName: application.guardianName,
          parentPhone: application.mobile, // Optional mapping
          address: typeof application.address === 'object' ? JSON.stringify(application.address) : null,
          bloodGroup: null,
          admissionDate: new Date(),
        }
      });

      return { student, updatedApp };
    });

    revalidatePath(`/app/[tenant]/admin/students`);
    revalidatePath(`/app/[tenant]/admin/students/applications`);
    
    return { success: true, data: result.student };
  } catch (error: any) {
    console.error("Error approving application:", error);
    return { success: false, error: "Failed to approve application." };
  }
}

export async function rejectApplication(applicationId: string, reason: string) {
  try {
    await db.admissionApplication.update({
      where: { id: applicationId },
      data: { status: "REJECTED", rejectionReason: reason }
    });
    
    revalidatePath(`/app/[tenant]/admin/students/applications`);
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting application:", error);
    return { success: false, error: "Failed to reject application." };
  }
}
