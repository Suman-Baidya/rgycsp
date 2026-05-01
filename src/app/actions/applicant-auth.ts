"use server";

import { db } from "@/lib/prisma";

export async function loginApplicant(workspaceId: string, applicationNo: string, tempPassword: string) {
  try {
    const application = await db.admissionApplication.findUnique({
      where: { applicationNo },
      include: {
        course: { select: { title: true } }
      }
    });

    if (!application) {
      return { success: false, error: "Invalid Application Number or Password." };
    }

    if (application.workspaceId !== workspaceId) {
      return { success: false, error: "Application does not belong to this institute." };
    }

    if (application.tempPassword !== tempPassword) {
      return { success: false, error: "Invalid Application Number or Password." };
    }

    return { success: true, data: application };
  } catch (error: any) {
    console.error("Applicant login error:", error);
    return { success: false, error: "Failed to authenticate." };
  }
}
