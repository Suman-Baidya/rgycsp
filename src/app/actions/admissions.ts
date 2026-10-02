"use server";

import { revalidateWorkspacePath } from "@/lib/revalidate";


import { db } from "@/lib/prisma";
import { auth } from "@/auth";
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
      paymentType: data.paymentType || "ONE_TIME",
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
      
      let birthYear = "2000";
      if (data.dob) {
        const d = new Date(data.dob);
        if (!isNaN(d.getFullYear())) birthYear = d.getFullYear().toString();
      }
      let fname = (data.fullName || "Student").trim().split(/\s+/)[0];
      fname = fname.charAt(0).toUpperCase() + fname.slice(1).toLowerCase();
      const tempPassword = `${fname}${birthYear}`;

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

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/admissions", "layout");
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
      paymentType: data.paymentType || "ONE_TIME",
      customData
    };

    await db.admissionApplication.update({
      where: { id: applicationId, workspaceId },
      data: updateData
    });

    await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "/admin/admissions", "layout");
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
    
    await revalidateWorkspacePath(workspaceId, "/admin/admissions", "layout");
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
      let birthYear = "2000";
      if (app.dob) {
        const d = new Date(app.dob);
        if (!isNaN(d.getFullYear())) birthYear = d.getFullYear().toString();
      }
      let fname = (app.fullName || "Student").trim().split(/\s+/)[0];
      fname = fname.charAt(0).toUpperCase() + fname.slice(1).toLowerCase();
      const tempPassword = `${fname}${birthYear}`;
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

    await revalidateWorkspacePath(workspaceId, "/admin/admissions", "layout");
    await revalidateWorkspacePath(workspaceId, "/admin/students", "layout");
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
            paymentType: data.paymentType || "ONE_TIME",
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

    await revalidateWorkspacePath(workspaceId, "/admin/admissions", "layout");
    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Bulk registration error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Search existing students in a workspace to re-enroll them into a new course.
 */
export async function searchExistingStudentsForReEnrollment(workspaceId: string, query: string) {
  try {
    const q = query.trim();
    if (!q || q.length < 2) return { success: true, data: [] };

    const students = await db.studentProfile.findMany({
      where: {
        workspaceId,
        OR: [
          { enrollmentNo: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } }
        ]
      },
      include: {
        course: { select: { id: true, title: true, code: true, duration: true } },
        batch: { select: { id: true, name: true } },
        user: {
          select: {
            studentProfiles: {
              where: { workspaceId },
              select: {
                id: true,
                courseId: true,
                registrationNo: true,
                status: true,
                course: { select: { id: true, title: true, code: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return { success: true, data: students };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Enroll an existing student into a new course (Re-Admission).
 * Preserves the permanent enrollmentNo and verified biodata/documents while creating a new course record.
 */
export async function reEnrollExistingStudent(
  workspaceId: string,
  data: {
    existingProfileId: string;
    courseId: string;
    batchId?: string;
    admissionDate?: string;
    admissionFees?: number;
    paymentType?: string;
  }
) {
  try {
    const { existingProfileId, courseId, batchId, admissionDate, admissionFees, paymentType } = data;

    const existing = await db.studentProfile.findUnique({
      where: { id: existingProfileId, workspaceId },
      include: { course: true }
    });

    if (!existing) {
      return { success: false, error: "Existing student record not found." };
    }

    if (!courseId) {
      return { success: false, error: "Please select a valid course for re-enrollment." };
    }

    // Check if the student is already actively enrolled in this exact course
    const activeSameCourse = await db.studentProfile.findFirst({
      where: {
        workspaceId,
        userId: existing.userId,
        courseId,
        status: { in: ["REGISTERED", "UNREGISTERED"] }
      }
    });

    if (activeSameCourse) {
      return { success: false, error: `Student is already actively enrolled in this course (${activeSameCourse.enrollmentNo}).` };
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return { success: false, error: "Selected course does not exist." };
    }

    // Create a new StudentProfile row for this new course enrollment
    const newProfile = await db.studentProfile.create({
      data: {
        workspaceId,
        userId: existing.userId,
        enrollmentNo: existing.enrollmentNo, // Permanent institutional ID maintained
        fullName: existing.fullName,
        dob: existing.dob,
        gender: existing.gender,
        bloodGroup: existing.bloodGroup,
        religion: existing.religion,
        caste: existing.caste,
        phone: existing.phone,
        email: existing.email,
        whatsapp: existing.whatsapp,
        parentName: existing.parentName,
        parentPhone: existing.parentPhone,
        fatherName: existing.fatherName,
        motherName: existing.motherName,
        guardianPhone: existing.guardianPhone,
        address: existing.address,
        qualification: existing.qualification ? (existing.qualification as any) : null,
        photoUrl: existing.photoUrl,
        signatureUrl: existing.signatureUrl,
        idProofUrl: existing.idProofUrl,
        loginPassword: existing.loginPassword,
        paymentType: paymentType || existing.paymentType || "ONE_TIME",
        courseId,
        batchId: batchId || null,
        admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        status: "UNREGISTERED" // Ready for registration and wallet deduction
      }
    });

    // Create fee invoice if fee > 0
    if (admissionFees && admissionFees > 0) {
      await db.invoice.create({
        data: {
          workspaceId,
          studentProfileId: newProfile.id,
          amount: admissionFees,
          status: "PENDING",
          dueDate: new Date(),
          notes: `Course Admission Fee for ${course.title}`
        }
      });
    }

    // Create notification for admin
    await db.notification.create({
      data: {
        workspaceId,
        title: "Student Re-Enrolled",
        message: `${existing.fullName} (${existing.enrollmentNo}) has been successfully enrolled into ${course.title}.`,
        type: "APPLICATION",
        link: "/admin/students"
      }
    });

    await revalidateWorkspacePath(workspaceId, "/admin/students", "layout");
    await revalidateWorkspacePath(workspaceId, "/admin/admissions", "layout");

    return { success: true, studentId: newProfile.id, enrollmentNo: existing.enrollmentNo };
  } catch (error: any) {
    console.error("Re-enrollment error:", error);
    return { success: false, error: error.message || "Failed to re-enroll student." };
  }
}

/**
 * Student self-initiated re-admission application from student dashboard.
 * Retains permanent enrollmentNo, snaps current profile biodata, and alerts franchise admin.
 */
export async function applyForStudentReAdmission(workspaceId: string, courseId: string, remarks?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated." };
    }

    // Find the student's existing profile in this workspace
    const existingProfile = await db.studentProfile.findFirst({
      where: { userId: session.user.id, workspaceId },
      orderBy: { createdAt: "desc" }
    });

    if (!existingProfile) {
      return { success: false, error: "Existing student profile not found." };
    }

    const targetCourse = await db.course.findUnique({
      where: { id: courseId }
    });

    if (!targetCourse) {
      return { success: false, error: "Course not found." };
    }

    // Check if already actively enrolled in this course
    const activeSameCourse = await db.studentProfile.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        workspaceId,
        status: { not: "PASS_OUT" }
      }
    });

    if (activeSameCourse) {
      return { success: false, error: "You are already actively enrolled in this course." };
    }

    // Generate Application Number
    const appCount = await db.admissionApplication.count({ where: { workspaceId } });
    const year = new Date().getFullYear();
    const applicationNo = `APP${year}${String(appCount + 1).padStart(4, '0')}`;

    // Create AdmissionApplication with status PENDING and customData marked as RE_ADMISSION
    const app = await db.admissionApplication.create({
      data: {
        workspaceId,
        applicationNo,
        source: "ONLINE",
        status: "PENDING",
        fullName: existingProfile.fullName,
        mobile: existingProfile.phone || "",
        email: existingProfile.email || session.user.email || null,
        whatsapp: existingProfile.whatsapp || null,
        courseId,
        fatherName: existingProfile.fatherName || null,
        motherName: existingProfile.motherName || null,
        guardianPhone: existingProfile.guardianPhone || null,
        dob: existingProfile.dob || null,
        gender: existingProfile.gender || null,
        bloodGroup: existingProfile.bloodGroup || null,
        religion: existingProfile.religion || null,
        caste: existingProfile.caste || null,
        address: (existingProfile.address ? (typeof existingProfile.address === "string" ? { full: existingProfile.address } : existingProfile.address) : undefined) as any,
        qualification: (existingProfile.qualification || undefined) as any,
        photoUrl: existingProfile.photoUrl || null,
        signatureUrl: existingProfile.signatureUrl || null,
        idProofUrl: existingProfile.idProofUrl || null,
        paymentType: existingProfile.paymentType || "ONE_TIME",
        customData: {
          isReAdmission: true,
          reEnrollmentNo: existingProfile.enrollmentNo,
          existingStudentProfileId: existingProfile.id,
          studentRemarks: remarks || null
        }
      }
    });

    // Notify Workspace Admin(s)
    await db.notification.create({
      data: {
        workspaceId,
        title: "New Re-Admission Application",
        message: `Student ${existingProfile.fullName} (${existingProfile.enrollmentNo}) has submitted a re-admission application for "${targetCourse.title}".`,
        type: "APPLICATION",
        priority: "HIGH",
        status: "PUBLISHED",
        targetAudience: "STAFF",
        link: `/admin/students/applications/${app.id}`
      }
    });

    await revalidateWorkspacePath(workspaceId, "/admin/admissions", "layout");
    await revalidateWorkspacePath(workspaceId, "/student/courses", "layout");

    return { 
      success: true, 
      applicationNo, 
      message: `Your re-admission application (${applicationNo}) has been submitted successfully.` 
    };
  } catch (error: any) {
    console.error("Re-admission application error:", error);
    return { success: false, error: error.message || "Failed to submit re-admission application." };
  }
}
