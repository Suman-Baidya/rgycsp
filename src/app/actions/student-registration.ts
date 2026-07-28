"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDocumentStatus, isMarksheetAutoIssued } from "@/lib/document-utils";

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
      const allFeeConfigs = await db.registrationFeeConfig.findMany();
      const feeConfig = allFeeConfigs.find(c => c.duration.toLowerCase().trim() === duration.toLowerCase().trim());
      
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

      // 2. Generate Registration, Certificate and Marksheet Nos
      let config = await tx.registrationConfig.findFirst();
      if (!config) {
        config = await tx.registrationConfig.create({ data: {} });
      }

      const series = config.registrationSeries || "B";
      
      const rawCode = workspace.centerCode || workspace.subdomain;
      const centerCode = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const admissionDate = student.admissionDate ? new Date(student.admissionDate) : new Date();
      const year = admissionDate.getFullYear();
      
      const regCount = await tx.studentRegistration.count();
      const seqNumber = String(regCount + 1).padStart(5, '0');
      
      const registrationNo = `${centerCode}Y${year}${series}${seqNumber}`;

      const cPadding = config.certificateDigits || 4;
      const certificateNo = `${config.certificatePrefix}${String(config.certificateNextSeq).padStart(cPadding, '0')}`;

      const mPadding = config.marksheetDigits || 4;
      const marksheetNo = `${config.marksheetPrefix}${String(config.marksheetNextSeq).padStart(mPadding, '0')}`;

      await tx.registrationConfig.update({
        where: { id: config.id },
        data: { 
          certificateNextSeq: config.certificateNextSeq + 1,
          marksheetNextSeq: config.marksheetNextSeq + 1
        }
      });

      // Create Registration
      await tx.studentRegistration.create({
        data: {
          studentProfileId: student.id,
          courseId: course.id,
          registrationNo: registrationNo
        }
      });

      // 3. Update student status to REGISTERED and apply new numbers
      await tx.studentProfile.update({
        where: { id: studentId },
        data: { 
          status: "REGISTERED",
          certificateNo: student.certificateNo || certificateNo,
          marksheetNo: student.marksheetNo || marksheetNo,
          registrationNo: registrationNo
        }
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
      where: { id: studentId },
      include: { semesters: true }
    });

    if (!student) {
      return { success: false, error: "Student not found." };
    }

    if (student.status !== "REGISTERED") {
      return { success: false, error: "Only active registered students can be marked as passed out." };
    }

    const config = await db.registrationConfig.findFirst();
    const certStatus = getDocumentStatus(student, null, config);
    
    let isMarksheetIssued = student.marksheetIssuedToStudent;
    if (student.semesters && student.semesters.length > 0) {
      isMarksheetIssued = student.semesters.every(sem => sem.marksheetIssuedToStudent || isMarksheetAutoIssued(sem, config, student));
    } else {
      isMarksheetIssued = isMarksheetIssued || certStatus.isMarksheetAuto;
    }

    const isCertIssued = student.certificateIssuedToStudent || certStatus.isCertAuto;

    if (!student.admitCardIssuedToStudent || !student.registrationCardIssuedToStudent || !isMarksheetIssued || !isCertIssued) {
      return { success: false, error: "All documents must be issued to the student before marking them as pass out." };
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
