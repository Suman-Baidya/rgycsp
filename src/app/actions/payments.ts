"use server";

import { revalidateWorkspacePath } from "@/lib/revalidate";


import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// -----------------------------------------------------------------
// Franchise Payment Config
// -----------------------------------------------------------------

export async function getFranchisePaymentConfig(workspaceId: string) {
  try {
    const config = await db.franchisePaymentConfig.findUnique({
      where: { workspaceId }
    });
    return { success: true, data: config };
  } catch (error: any) {
    console.error("Failed to fetch franchise payment config:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFranchisePaymentConfig(workspaceId: string, data: any) {
  try {
    const config = await db.franchisePaymentConfig.upsert({
      where: { workspaceId },
      update: {
        upiId: data.upiId,
        qrCodeUrl: data.qrCodeUrl,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        instructions: data.instructions,
      },
      create: {
        workspaceId,
        upiId: data.upiId,
        qrCodeUrl: data.qrCodeUrl,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        instructions: data.instructions,
      }
    });

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/students");
    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/student/dashboard/fees");
    
    return { success: true, data: config };
  } catch (error: any) {
    console.error("Failed to update franchise payment config:", error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------
// Invoices / Offline Payments
// -----------------------------------------------------------------

export async function getStudentInvoices(studentProfileId: string) {
  try {
    const invoices = await db.invoice.findMany({
      where: { studentProfileId },
      orderBy: { dueDate: "asc" }
    });
    return { success: true, data: invoices };
  } catch (error: any) {
    console.error("Failed to fetch student invoices:", error);
    return { success: false, error: error.message };
  }
}

export async function generateStudentPaymentStructure(studentProfileId: string, workspaceId: string) {
  try {
    // 1. Get the student and their course
    const student = await db.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { course: true }
    });

    if (!student) throw new Error("Student not found");
    if (!student.course) throw new Error("Student is not enrolled in a course");

    const course = student.course;

    // Check if invoices already exist to avoid duplicates
    const existingInvoices = await db.invoice.findFirst({
      where: { studentProfileId }
    });

    if (existingInvoices) {
      throw new Error("Payment structure already generated for this student.");
    }

    const newInvoices = [];
    const now = new Date();

    // 2. Generate Admission Fee Invoice (Due immediately)
    if (course.admissionFee > 0) {
      newInvoices.push({
        workspaceId,
        studentProfileId,
        amount: course.admissionFee,
        status: "PENDING",
        dueDate: now,
        notes: "Admission Fee",
        feeType: "ADMISSION",
      });
    }

    // 3. Generate Registration Fee Invoice (Due immediately)
    if (course.registrationFee > 0) {
      newInvoices.push({
        workspaceId,
        studentProfileId,
        amount: course.registrationFee,
        status: "PENDING",
        dueDate: now,
        notes: "Registration Fee",
        feeType: "REGISTRATION",
      });
    }

    // 4. Generate Course Fee / Installments
    if (student.paymentType === "EMI" && course.isInstallmentBased && course.installmentAmount && course.totalInstallments) {
      for (let i = 1; i <= course.totalInstallments; i++) {
        // Due dates spaced by 1 month starting from next month
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);

        newInvoices.push({
          workspaceId,
          studentProfileId,
          amount: course.installmentAmount,
          status: "PENDING",
          dueDate: dueDate,
          notes: `Course Installment ${i} of ${course.totalInstallments}`,
          feeType: "INSTALLMENT",
          installmentNo: i,
        });
      }
    } else if (course.totalCourseFee > 0) {
      newInvoices.push({
        workspaceId,
        studentProfileId,
        amount: course.totalCourseFee,
        status: "PENDING",
        dueDate: now, // or maybe +1 month? Let's say immediate for full course.
        notes: "Full Course Fee",
        feeType: "FULL_COURSE",
      });
    }

    // Create all invoices in a transaction
    await db.$transaction(
      newInvoices.map(inv => db.invoice.create({ data: inv as any }))
    );

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/students");
    return { success: true, message: "Payment structure generated successfully" };
  } catch (error: any) {
    console.error("Failed to generate payment structure:", error);
    return { success: false, error: error.message };
  }
}

export async function recordManualOfflinePayment(invoiceId: string, paymentMethod: string, notes: string) {
  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidDate: new Date(),
        paymentMethod,
        notes: notes ? notes : undefined
      }
    });

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/students");
    return { success: true, data: invoice };
  } catch (error: any) {
    console.error("Failed to record payment:", error);
    return { success: false, error: error.message };
  }
}

export async function getPaymentsReport(workspaceId: string, startDate?: Date, endDate?: Date) {
  try {
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        paidDate: {
          gte: startDate,
          lte: endDate,
        }
      };
    }

    const invoices = await db.invoice.findMany({
      where: {
        workspaceId,
        status: "PAID",
        ...dateFilter
      },
      include: {
        student: {
          select: { fullName: true, enrollmentNo: true, phone: true }
        }
      },
      orderBy: { paidDate: "desc" }
    });

    return { success: true, data: invoices };
  } catch (error: any) {
    console.error("Failed to fetch payment reports:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInvoiceProof(invoiceId: string, paymentProofUrl: string) {
  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProof: paymentProofUrl,
        // Keep status as PENDING, but admin will see the proof
      }
    });

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/student/dashboard/fees");
    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/students");
    
    return { success: true, data: invoice };
  } catch (error: any) {
    console.error("Failed to update invoice proof:", error);
    return { success: false, error: error.message };
  }
}


export async function getPendingFeePayments(workspaceId: string) {
  try {
    const invoices = await db.invoice.findMany({
      where: {
        workspaceId,
        status: "PENDING",
        paymentProof: { not: null }
      },
      include: {
        student: {
          select: { fullName: true, enrollmentNo: true, phone: true }
        }
      },
      orderBy: { dueDate: "asc" }
    });
    return { success: true, data: invoices };
  } catch (error: any) {
    console.error("Failed to fetch pending fee payments:", error);
    return { success: false, error: error.message };
  }
}

export async function getPendingFeePaymentsCount(workspaceId: string) {
  try {
    const count = await db.invoice.count({
      where: {
        workspaceId,
        status: "PENDING",
        paymentProof: { not: null }
      }
    });
    return { success: true, count };
  } catch (error: any) {
    console.error("Failed to fetch pending fee payments count:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectInvoiceProof(invoiceId: string, reason: string) {
  try {
    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProof: null,
        rejectionReason: reason
      }
    });

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/student/dashboard/fees");
    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/students");
    
    return { success: true, data: invoice };
  } catch (error: any) {
    console.error("Failed to reject invoice proof:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInvoiceInfo(invoiceId: string, data: { amount: number; dueDate: string }) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const updated = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        amount: Number(data.amount),
        dueDate: new Date(data.dueDate)
      }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return { success: false, error: "Failed to update invoice" };
  }
}
