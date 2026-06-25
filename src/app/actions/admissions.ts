"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Save an admission application as DRAFT.
 * If an applicationId is provided, it updates the existing draft.
 */
export async function saveDraftApplication(workspaceId: string, data: any, applicationId?: string) {
  try {
    let appRecord;
    
    // Combine address logic like the online form
    const address = data.vill || data.po || data.ps || data.dist || data.pin || data.state 
      ? { vill: data.vill, po: data.po, ps: data.ps, dist: data.dist, pin: data.pin, state: data.state }
      : data.address || null;

    // Combine qualification logic
    const qualification = data.qualName || data.qualYear || data.qualPercent || data.qualBoard
      ? { name: data.qualName, year: data.qualYear, percentage: data.qualPercent, board: data.qualBoard }
      : data.qualification || null;

    // Process custom Data (Batch, Fees, Custom Docs)
    const customData = {
      ...data.customData, // Spread incoming custom data (like custom documents)
      intendedBatchId: data.batchId || null,
      intendedFees: data.fees || null,
    };

    const courseIdClean = data.courseId && typeof data.courseId === 'string' && data.courseId.trim() !== "" ? data.courseId.trim() : null;

    const updateData = {
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      courseId: courseIdClean,
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      guardianPhone: data.guardianPhone || null,
      dob: data.dob ? new Date(data.dob) : null,
      gender: data.gender || null,
      bloodGroup: data.bloodGroup || null,
      religion: data.religion || null,
      caste: data.caste || null,
      address: address, 
      qualification: qualification,
      photoUrl: data.photoUrl || null,
      signatureUrl: data.signatureUrl || null,
      idProofUrl: data.idProofUrl || null,
      status: "DRAFT" as any,
      customData
    };

    if (applicationId) {
      // Update existing
      appRecord = await db.admissionApplication.update({
        where: { id: applicationId, workspaceId },
        data: updateData
      });
    } else {
      // Create new draft
      const namePart = data.fullName ? data.fullName.replace(/\s/g, '').substring(0, 5).toUpperCase().padEnd(5, 'X') : 'DRAFT';
      const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
      const applicationNo = `${namePart}${randomDigits}`;
      
      const crypto = require('crypto');
      const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 char temp password

      appRecord = await db.admissionApplication.create({
        data: {
          workspaceId,
          applicationNo,
          tempPassword,
          source: "MANUAL",
          ...updateData
        }
      });
    }

    revalidatePath(`/app/[tenant]/admin/admissions`, "layout");
    return { success: true, application: appRecord };
  } catch (error: any) {
    console.error("Save Draft error:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePendingApplication(workspaceId: string, applicationId: string, data: any) {
  try {
    const address = data.vill || data.po || data.ps || data.dist || data.pin || data.state 
      ? { vill: data.vill, po: data.po, ps: data.ps, dist: data.dist, pin: data.pin, state: data.state }
      : data.address || null;

    const qualification = data.qualName || data.qualYear || data.qualPercent || data.qualBoard
      ? { name: data.qualName, year: data.qualYear, percentage: data.qualPercent, board: data.qualBoard }
      : data.qualification || null;

    const customData = {
      ...data.customData,
      intendedBatchId: data.batchId || null,
      intendedFees: data.fees || null,
    };

    const courseIdClean = data.courseId && typeof data.courseId === 'string' && data.courseId.trim() !== "" ? data.courseId.trim() : null;

    const updateData = {
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      courseId: courseIdClean,
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      guardianPhone: data.guardianPhone || null,
      dob: data.dob ? new Date(data.dob) : null,
      gender: data.gender || null,
      bloodGroup: data.bloodGroup || null,
      religion: data.religion || null,
      caste: data.caste || null,
      address: address as any, 
      qualification: qualification as any,
      photoUrl: data.photoUrl || null,
      signatureUrl: data.signatureUrl || null,
      idProofUrl: data.idProofUrl || null,
      customData
    };

    await db.admissionApplication.update({
      where: { id: applicationId, workspaceId },
      data: updateData
    });

    revalidatePath(`/app/[tenant]/admin/admissions`, "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Update pending error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDraftApplications(workspaceId: string, applicationIds: string[]) {
  try {
    await db.admissionApplication.deleteMany({
      where: {
        workspaceId,
        id: { in: applicationIds },
        status: "DRAFT"
      }
    });
    
    revalidatePath(`/app/[tenant]/admin/admissions`, "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Delete draft error:", error);
    return { success: false, error: error.message };
  }
}

import { updateApplicationStatus } from "./admission";

/**
 * Final Enroll an application (DRAFT or PENDING).
 * Validates fields and creates the StudentProfile (UNREGISTERED) via updateApplicationStatus.
 */
export async function finalEnrollApplication(workspaceId: string, applicationId: string, dataOverride?: any) {
  try {
    const app = await db.admissionApplication.findUnique({
      where: { id: applicationId, workspaceId }
    });

    if (!app) return { success: false, error: "Application not found" };
    
    const finalCourseId = dataOverride?.courseId || app.courseId;
    const customData = app.customData as any || {};
    const finalBatchId = dataOverride?.batchId || customData?.intendedBatchId || null;
    const finalFees = dataOverride?.fees || customData?.intendedFees || 0;

    const address = app.address as any;
    const hasAddress = address && address.vill && address.po && address.ps && address.dist && address.pin && address.state;

    if (
      !app.fullName || !app.mobile || !finalCourseId || !finalBatchId || 
      !app.fatherName || !app.motherName || !app.dob || !hasAddress || 
      !app.photoUrl || !app.signatureUrl || !app.idProofUrl
    ) {
      return { success: false, error: "Missing mandatory fields. All personal details, complete address, batch, and 3 documents must be completed before Final Enrollment." };
    }

    // Ensure application has a tempPassword (mostly for older drafts that missed it)
    if (!app.tempPassword) {
      const crypto = require('crypto');
      const tempPassword = crypto.randomBytes(4).toString('hex');
      await db.admissionApplication.update({
        where: { id: applicationId },
        data: { courseId: finalCourseId, tempPassword }
      });
    } else {
      // Just update courseId if changed
      await db.admissionApplication.update({
        where: { id: applicationId },
        data: { courseId: finalCourseId }
      });
    }

    // Call the central approval function to create User, Roles, and StudentProfile
    const res = await updateApplicationStatus(applicationId, "APPROVED", undefined, finalBatchId);
    if (!res.success) {
       return res; // bubble up the error
    }

    // Fetch the newly created student to attach invoices
    const student = await db.studentProfile.findUnique({
       where: { applicationId: applicationId }
    });

    if (student && finalFees && parseFloat(finalFees) > 0) {
      await db.invoice.create({
        data: {
          workspaceId,
          studentProfileId: student.id,
          amount: parseFloat(finalFees),
          status: "PENDING",
          dueDate: new Date(),
          notes: "Admission Fee"
        }
      });
    }

    revalidatePath(`/app/[tenant]/admin/admissions`, "layout");
    revalidatePath(`/app/[tenant]/admin/students`, "layout");
    return { success: true, studentId: student?.id };
  } catch (error: any) {
    console.error("Final Enroll error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk import students from CSV data as DRAFT applications.
 */
export async function bulkRegisterStudentsAction(workspaceId: string, studentsData: any[]) {
  try {
    let successCount = 0;
    
    for (const data of studentsData) {
      if (!data.fullName || (!data.mobile && !data.email)) continue;

      try {
        const namePart = data.fullName.replace(/\s/g, '').substring(0, 5).toUpperCase().padEnd(5, 'X');
        const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
        const applicationNo = `${namePart}${randomDigits}`;

        // Create them as DRAFT applications from CSV
        const crypto = require('crypto');
        const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 char temp password

        let courseId = data.courseId && typeof data.courseId === 'string' && data.courseId.trim() !== "" ? data.courseId.trim() : null;
        
        // Validate courseId to prevent foreign key constraint violations
        if (courseId) {
          const courseExists = await db.course.findUnique({
            where: { id: courseId }
          });
          if (!courseExists || courseExists.workspaceId !== workspaceId) {
            courseId = null; // Set to null if invalid to save as draft anyway
          }
        }

        const batchId = data.batchId && typeof data.batchId === 'string' && data.batchId.trim() !== "" ? data.batchId.trim() : null;

        const address = data.vill || data.po || data.ps || data.dist || data.pin || data.state 
          ? { vill: data.vill, po: data.po, ps: data.ps, dist: data.dist, pin: data.pin, state: data.state }
          : null;

        const qualification = data.qualName || data.qualYear || data.qualPercent || data.qualBoard
          ? { name: data.qualName, year: data.qualYear, percentage: data.qualPercent, board: data.qualBoard }
          : null;

        await db.admissionApplication.create({
          data: {
            workspaceId,
            applicationNo,
            fullName: data.fullName,
            mobile: data.mobile || "",
            email: data.email || null,
            whatsapp: data.whatsapp || null,
            fatherName: data.fatherName || null,
            motherName: data.motherName || null,
            guardianPhone: data.guardianPhone || null,
            dob: data.dob ? new Date(data.dob) : null,
            gender: data.gender || null,
            bloodGroup: data.bloodGroup || null,
            religion: data.religion || null,
            caste: data.caste || null,
            address: address as any,
            qualification: qualification as any,
            courseId: courseId,
            status: "DRAFT" as any,
            source: "CSV" as any,
            tempPassword: tempPassword,
            customData: {
              intendedBatchId: batchId,
              intendedFees: data.fees || null
            }
          }
        });
        
        successCount++;
      } catch (rowError) {
        console.error(`Error importing student ${data.fullName}:`, rowError);
        // Continue to the next row
      }
    }

    revalidatePath(`/app/[tenant]/admin/admissions`, "layout");
    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Bulk registration error:", error);
    return { success: false, error: error.message };
  }
}
