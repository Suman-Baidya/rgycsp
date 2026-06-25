"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registerStudent(studentId: string, tenant: string) {
  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        course: true,
        workspace: true
      }
    });

    if (!student) {
      return { success: false, error: "Student not found." };
    }

    if (student.status !== "UNREGISTERED") {
      return { success: false, error: "Student is already registered or passed out." };
    }

    const workspace = student.workspace;
    const course = student.course;

    if (!course) {
      return { success: false, error: "Student must be assigned to a course before registration." };
    }

    const duration = course.duration;
    let feeAmount = 0;

    if (duration) {
      const feeConfig = await db.registrationFeeConfig.findUnique({
        where: { duration }
      });
      if (feeConfig) {
        feeAmount = feeConfig.amount;
      }
    } else {
      return { success: false, error: "Assigned course does not have a duration specified." };
    }

    if (feeAmount > 0 && workspace.walletBalance < feeAmount) {
      return { success: false, error: `Insufficient wallet balance. Registration fee is ₹${feeAmount}, but your balance is ₹${workspace.walletBalance}. Please recharge your wallet.` };
    }

    // Wrap in transaction
    await db.$transaction(async (tx) => {
      // 1. Deduct wallet balance if applicable
      if (feeAmount > 0) {
        const updatedWorkspace = await tx.workspace.updateMany({
          where: { id: workspace.id, walletBalance: { gte: feeAmount } },
          data: { walletBalance: { decrement: feeAmount } }
        });

        if (updatedWorkspace.count === 0) {
          throw new Error(`Transaction failed: Insufficient wallet balance. Needed: ₹${feeAmount}`);
        }

        await tx.walletTransaction.create({
          data: {
            workspaceId: workspace.id,
            amount: feeAmount,
            type: "DEBIT",
            status: "APPROVED",
            description: `Student Registration Fee for ${student.fullName} (${student.enrollmentNo})`
          }
        });
      }

      // 2. Update student status to REGISTERED
      await tx.studentProfile.update({
        where: { id: studentId },
        data: { status: "REGISTERED" }
      });
    });

    revalidatePath(`/app/${tenant}/admin/students`);
    revalidatePath(`/app/${tenant}/admin/wallet`);
    revalidatePath(`/app/${tenant}/admin`, "layout");

    return { success: true, message: `Student registered successfully. ₹${feeAmount} deducted from wallet.` };
  } catch (error: any) {
    console.error("Error registering student:", error);
    return { success: false, error: error.message || "Failed to register student." };
  }
}

export async function toggleDocumentApproval(studentId: string, docType: 'admitCard' | 'registrationCard' | 'marksheet' | 'certificate', tenant: string) {
  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return { success: false, error: "Student not found." };
    }

    if (student.status !== "REGISTERED") {
      return { success: false, error: "Only active registered students can have document approvals." };
    }

    const updateData: any = {};
    if (docType === 'admitCard') updateData.admitCardApproved = !student.admitCardApproved;
    if (docType === 'registrationCard') updateData.registrationCardApproved = !student.registrationCardApproved;
    if (docType === 'marksheet') updateData.marksheetApproved = !student.marksheetApproved;
    if (docType === 'certificate') updateData.certificateApproved = !student.certificateApproved;

    await db.studentProfile.update({
      where: { id: studentId },
      data: updateData
    });

    revalidatePath(`/app/${tenant}/admin/students`);
    return { success: true, message: `Document approval toggled successfully.` };
  } catch (error: any) {
    console.error("Error toggling document approval:", error);
    return { success: false, error: error.message || "Failed to toggle document approval." };
  }
}

export async function markStudentAsPassOut(studentId: string, tenant: string) {
  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return { success: false, error: "Student not found." };
    }

    if (student.status !== "REGISTERED") {
      return { success: false, error: "Only active registered students can be marked as passed out." };
    }

    if (!student.admitCardApproved || !student.registrationCardApproved || !student.marksheetApproved || !student.certificateApproved) {
      return { success: false, error: "All documents must be approved before marking the student as pass out." };
    }

    await db.studentProfile.update({
      where: { id: studentId },
      data: { status: "PASS_OUT" }
    });

    revalidatePath(`/app/${tenant}/admin/students`);
    return { success: true, message: "Student marked as passed out successfully." };
  } catch (error: any) {
    console.error("Error marking student as pass out:", error);
    return { success: false, error: error.message || "Failed to mark student as pass out." };
  }
}
