"use server";

import { db } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { isValidIssueGap, isValidMarksheetGap, getRequiredMarksheetCount, getExpectedUnitsForSemester } from "@/lib/course-utils";

const getCachedRegistrationConfig = unstable_cache(
  async () => {
    return await db.registrationConfig.findFirst();
  },
  ["global-registration-config"],
  { revalidate: 1800, tags: ["registration-config"] }
);

export async function processPendingAutoCertificateIssues() {
  try {
    const config = await db.registrationConfig.findFirst();
    if (!config || !config.autoQuickIssueEnabled) {
      // Auto-issue is disabled by Super Admin; all requests strictly require manual review
      return { success: true, processedCount: 0, mode: "manual" };
    }

    const delayMinutes = config.autoIssueAfterRequestMinutes || 60;
    if (delayMinutes <= 0) {
      return { success: true, processedCount: 0, mode: "disabled" };
    }

    const cutoffDate = new Date(Date.now() - delayMinutes * 60 * 1000);

    const pendingStudents = await db.studentProfile.findMany({
      where: {
        documentIssueRequestedAt: {
          lte: cutoffDate,
          not: null
        },
        certificateApproved: false
      },
      include: {
        course: true,
        semesters: { include: { marks: true } },
        workspace: true
      },
      take: 50
    });

    if (pendingStudents.length === 0) {
      return { success: true, processedCount: 0 };
    }

    let processedCount = 0;

    for (const student of pendingStudents) {
      // 1. Duration check
      if (student.course?.duration) {
        const gapCheck = isValidIssueGap(student.admissionDate, student.course.duration);
        if (!gapCheck.valid) continue;

        const requiredCount = getRequiredMarksheetCount(student.course.duration);
        const issuedCount = student.semesters.filter((s: any) => s.marksheetApproved || s.marksheetIssuedToStudent).length;
        if (issuedCount < requiredCount) continue;
      }

      await db.$transaction(async (tx) => {
        let currentConfig = await tx.registrationConfig.findFirst();
        if (!currentConfig) currentConfig = await tx.registrationConfig.create({ data: {} });

        let certNo = student.certificateNo;
        if (!certNo) {
          const padding = currentConfig.certificateDigits || 4;
          certNo = `${currentConfig.certificatePrefix}${String(currentConfig.certificateNextSeq).padStart(padding, '0')}`;
          await tx.registrationConfig.update({
            where: { id: currentConfig.id },
            data: { certificateNextSeq: currentConfig.certificateNextSeq + 1 }
          });
        }

        await tx.studentProfile.update({
          where: { id: student.id },
          data: {
            certificateNo: certNo,
            certificateApproved: true,
            status: "PASS_OUT"
          }
        });

        if (student.workspaceId) {
          await tx.notification.create({
            data: {
              workspaceId: student.workspaceId,
              title: "Certificate Auto-Issued",
              message: `Certificate for ${student.fullName} (${student.enrollmentNo}) has been automatically approved following the ${delayMinutes}-minute timer.`,
              type: "DOCUMENT",
              link: "/admin/students"
            }
          });
        }
      });

      processedCount++;
    }

    if (processedCount > 0) {
      revalidatePath("/super-admin/students");
      revalidatePath("/");
    }

    return { success: true, processedCount };
  } catch (error: any) {
    console.error("Error in processPendingAutoCertificateIssues:", error);
    return { success: false, error: error.message };
  }
}

export async function getPendingDocumentRequestsCount() {
  try {
    // Process any due auto-issues first
    await processPendingAutoCertificateIssues();

    const count = await db.studentProfile.count({
      where: {
        documentIssueRequestedAt: {
          not: null
        },
        certificateApproved: false
      }
    });
    return { success: true, count };
  } catch (error) {
    console.error("Error fetching pending document requests count:", error);
    return { success: false, count: 0 };
  }
}


export async function issueStudentDocument(studentId: string, documentType: "MARKSHEET" | "CERTIFICATE" | "STUDENT_ID" | "ADMIT_CARD", status: boolean, semesterNumber?: number) {
  try {
    const student = await db.studentProfile.findUnique({ 
      where: { id: studentId },
      include: { course: true, semesters: { include: { marks: true } } }
    });
    
    if (!student) return { success: false, error: "Student not found" };

    if (documentType === "CERTIFICATE") {
      if (status === false && student.status === "PASS_OUT") {
         return { success: false, error: "Cannot un-issue a certificate once the student has passed out." };
      }
      if (status === true && student.course?.duration) {
         const gapCheck = isValidIssueGap(student.admissionDate, student.course.duration);
         if (!gapCheck.valid) {
           return { success: false, error: `Minimum course duration not met. Certificate can be issued after ${gapCheck.requiredDate.toLocaleDateString('en-GB')}` };
         }
         const requiredCount = getRequiredMarksheetCount(student.course.duration);
         const issuedCount = student.semesters.filter((s: any) => s.marksheetApproved).length;
         if (issuedCount < requiredCount) {
           return { success: false, error: `Cannot issue certificate. This course requires ${requiredCount} marksheets, but only ${issuedCount} are approved.` };
         }
      }
    }

    if (documentType === "MARKSHEET" && semesterNumber && status === true) {
      if (student.course?.duration) {
        const gapCheck = isValidMarksheetGap(student.admissionDate, semesterNumber, student.course.duration);
        if (!gapCheck.valid) {
          return { success: false, error: `Minimum duration for Semester ${semesterNumber} not met. Marksheet can be issued after ${gapCheck.requiredDate.toLocaleDateString('en-GB')}` };
        }
      }
      
      if (semesterNumber > 1) {
        const prevSem = student.semesters.find((s: any) => s.semesterNumber === semesterNumber - 1);
        if (!prevSem || !prevSem.marksheetApproved) {
          return { success: false, error: `Cannot issue Semester ${semesterNumber} marksheet because Semester ${semesterNumber - 1} marksheet is not approved.` };
        }
      }

      const sem = student.semesters.find((s: any) => s.semesterNumber === semesterNumber);
      const expectedUnits = getExpectedUnitsForSemester(student.course, semesterNumber);
      if (!sem || !sem.marks || sem.marks.length < expectedUnits) {
        return { success: false, error: `Cannot issue marksheet. All ${expectedUnits} unit marks have not been entered for Semester ${semesterNumber}.` };
      }
    }

    if (documentType === "MARKSHEET" && semesterNumber) {
      if (status === true) {
        let marksheetNoToUse = student?.marksheetNo;

        if (!marksheetNoToUse) {
          await db.$transaction(async (tx) => {
            let config = await tx.registrationConfig.findFirst();
            if (!config) config = await tx.registrationConfig.create({ data: {} });

            const padding = config.marksheetDigits || 4;
            marksheetNoToUse = `${config.marksheetPrefix}${String(config.marksheetNextSeq).padStart(padding, '0')}`;
            
            await tx.registrationConfig.update({
              where: { id: config.id },
              data: { marksheetNextSeq: config.marksheetNextSeq + 1 }
            });

            await tx.studentProfile.update({
              where: { id: studentId },
              data: { marksheetNo: marksheetNoToUse }
            });

            await tx.studentSemester.upsert({
              where: { studentProfileId_semesterNumber: { studentProfileId: studentId, semesterNumber } },
              update: { marksheetApproved: true },
              create: { studentProfileId: studentId, semesterNumber, marksheetApproved: true }
            });
          });
          revalidatePath("/");
          return { success: true, marksheetNo: marksheetNoToUse };
        }
      }

      await db.studentSemester.upsert({
        where: { studentProfileId_semesterNumber: { studentProfileId: studentId, semesterNumber } },
        update: { 
          marksheetApproved: status,
          ...(status === false ? { marksheetIssuedToStudent: false } : {})
        },
        create: { studentProfileId: studentId, semesterNumber, marksheetApproved: status }
      });
      revalidatePath("/");
      return { success: true };
    }

    let data: any = {};
    
    if (documentType === "CERTIFICATE" && status === true) {
      if (!student.certificateNo) {
        let newCertificateNo = "";
        await db.$transaction(async (tx) => {
          let config = await tx.registrationConfig.findFirst();
          if (!config) config = await tx.registrationConfig.create({ data: {} });

          const padding = config.certificateDigits || 4;
          newCertificateNo = `${config.certificatePrefix}${String(config.certificateNextSeq).padStart(padding, '0')}`;
          
          await tx.registrationConfig.update({
            where: { id: config.id },
            data: { certificateNextSeq: config.certificateNextSeq + 1 }
          });
        });
        data.certificateNo = newCertificateNo;
      }
    }

    switch (documentType) {
      case "MARKSHEET": data.marksheetApproved = status; if (status === false) data.marksheetIssuedToStudent = false; break;
      case "CERTIFICATE": 
        data.certificateApproved = status; 
        if (status === false) {
          data.certificateIssuedToStudent = false; 
        } else {
          data.status = "PASS_OUT"; // Change status to PASS_OUT when certificate is approved
        }
        break;
      case "STUDENT_ID": data.registrationCardApproved = status; if (status === false) data.registrationCardIssuedToStudent = false; break;
      case "ADMIT_CARD": data.admitCardApproved = status; if (status === false) data.admitCardIssuedToStudent = false; break;
    }

    await db.studentProfile.update({
      where: { id: studentId },
      data
    });

    if (documentType === "CERTIFICATE" && status === true && student.workspaceId) {
      await db.notification.create({
        data: {
          workspaceId: student.workspaceId,
          title: "Certificate Approved",
          message: `Super Admin has approved the completion certificate for ${student.fullName} (${student.enrollmentNo}).`,
          type: "DOCUMENT",
          link: "/admin/students"
        }
      });
    }
    
    revalidatePath("/super-admin/students");
    revalidatePath("/");
    return { success: true, certificateNo: data.certificateNo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Super Admin one-click action to immediately issue a certificate before or without timer trigger.
 */
export async function quickApproveCertificate(studentId: string) {
  try {
    const res = await issueStudentDocument(studentId, "CERTIFICATE", true);
    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to approve certificate." };
  }
}

export async function issueDocumentToStudent(studentId: string, documentType: "MARKSHEET" | "CERTIFICATE" | "STUDENT_ID" | "ADMIT_CARD", status: boolean, semesterNumber?: number) {
  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
      include: { course: true, semesters: { include: { marks: true } } }
    });

    if (!student) return { success: false, error: "Student not found" };

    if (documentType === "CERTIFICATE") {
      if (status === false && student.status === "PASS_OUT") {
        return { success: false, error: "Cannot un-issue a certificate once the student has passed out." };
      }
      if (status === true && student.course?.duration) {
        const gapCheck = isValidIssueGap(student.admissionDate, student.course.duration);
        if (!gapCheck.valid) {
          return { success: false, error: `Minimum course duration not met. Certificate can be issued after ${gapCheck.requiredDate.toLocaleDateString('en-GB')}` };
        }
        const requiredCount = getRequiredMarksheetCount(student.course.duration);
        const issuedCount = student.semesters.filter((s: any) => s.marksheetApproved || s.marksheetIssuedToStudent).length;
        if (issuedCount < requiredCount) {
          return { success: false, error: `Cannot issue certificate. This course requires ${requiredCount} marksheets, but only ${issuedCount} are issued/approved.` };
        }
      }
    }

    if (documentType === "MARKSHEET" && semesterNumber && status === true) {
      if (student.course?.duration) {
        const gapCheck = isValidMarksheetGap(student.admissionDate, semesterNumber, student.course.duration);
        if (!gapCheck.valid) {
          return { success: false, error: `Minimum duration for Semester ${semesterNumber} not met. Marksheet can be issued after ${gapCheck.requiredDate.toLocaleDateString('en-GB')}` };
        }
      }

      if (semesterNumber > 1) {
        const prevSem = student.semesters.find((s: any) => s.semesterNumber === semesterNumber - 1);
        if (!prevSem || (!prevSem.marksheetApproved && !prevSem.marksheetIssuedToStudent)) {
          return { success: false, error: `Cannot issue Semester ${semesterNumber} marksheet because Semester ${semesterNumber - 1} marksheet is not yet issued/approved.` };
        }
      }

      const sem = student.semesters.find((s: any) => s.semesterNumber === semesterNumber);
      const expectedUnits = getExpectedUnitsForSemester(student.course, semesterNumber);
      if (!sem || !sem.marks || sem.marks.length < expectedUnits) {
        return { success: false, error: `Cannot issue marksheet. All ${expectedUnits} unit marks have not been entered for Semester ${semesterNumber} on the Exam page.` };
      }
    }

    if (documentType === "MARKSHEET" && semesterNumber) {
      if (status === true) {
        let marksheetNoToUse = student.marksheetNo;

        if (!marksheetNoToUse) {
          // Generate number in a transaction
          await db.$transaction(async (tx) => {
            let config = await tx.registrationConfig.findFirst();
            if (!config) {
              config = await tx.registrationConfig.create({ data: {} });
            }

            const padding = config.marksheetDigits || 4;
            marksheetNoToUse = `${config.marksheetPrefix}${String(config.marksheetNextSeq).padStart(padding, '0')}`;
            
            await tx.registrationConfig.update({
              where: { id: config.id },
              data: { marksheetNextSeq: config.marksheetNextSeq + 1 }
            });

            await tx.studentProfile.update({
              where: { id: studentId },
              data: { marksheetNo: marksheetNoToUse }
            });

            await tx.studentSemester.upsert({
              where: { studentProfileId_semesterNumber: { studentProfileId: studentId, semesterNumber } },
              update: { marksheetIssuedToStudent: true },
              create: { studentProfileId: studentId, semesterNumber, marksheetIssuedToStudent: true }
            });
          });
          revalidatePath("/");
          return { success: true };
        } else {
          // The student already has a marksheetNo, just approve this semester
          await db.studentSemester.upsert({
            where: { studentProfileId_semesterNumber: { studentProfileId: studentId, semesterNumber } },
            update: { marksheetIssuedToStudent: true },
            create: { studentProfileId: studentId, semesterNumber, marksheetIssuedToStudent: true }
          });
          revalidatePath("/");
          return { success: true };
        }
      }

      await db.studentSemester.upsert({
        where: { studentProfileId_semesterNumber: { studentProfileId: studentId, semesterNumber } },
        update: { marksheetIssuedToStudent: status },
        create: { studentProfileId: studentId, semesterNumber, marksheetIssuedToStudent: status }
      });
      revalidatePath("/");
      return { success: true };
    }

    if (documentType === "CERTIFICATE" && status === true) {
      const student = await db.studentProfile.findUnique({ where: { id: studentId } });
      if (student && !student.certificateNo) {
        await db.$transaction(async (tx) => {
          let config = await tx.registrationConfig.findFirst();
          if (!config) {
            config = await tx.registrationConfig.create({ data: {} });
          }

          const padding = config.certificateDigits || 4;
          const newCertificateNo = `${config.certificatePrefix}${String(config.certificateNextSeq).padStart(padding, '0')}`;
          
          await tx.registrationConfig.update({
            where: { id: config.id },
            data: { certificateNextSeq: config.certificateNextSeq + 1 }
          });

          await tx.studentProfile.update({
            where: { id: studentId },
            data: { certificateIssuedToStudent: true, certificateNo: newCertificateNo }
          });
        });
        revalidatePath("/");
        return { success: true };
      }
    }

    let data: any = {};
    switch (documentType) {
      case "MARKSHEET": data = { marksheetIssuedToStudent: status }; break;
      case "CERTIFICATE": data = { certificateIssuedToStudent: status }; break;
      case "STUDENT_ID": data = { registrationCardIssuedToStudent: status }; break;
      case "ADMIT_CARD": data = { admitCardIssuedToStudent: status }; break;
    }

    await db.studentProfile.update({
      where: { id: studentId },
      data
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveStudentMarks(studentId: string, semesterNumber: number, marksData: { unitName: string, marksObtained: number }[]) {
  try {
    let totalMarks = 0;
    for (const m of marksData) {
      totalMarks += m.marksObtained;
    }
    const maxTotal = marksData.length * 100;
    const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    const semester = await db.studentSemester.upsert({
      where: {
        studentProfileId_semesterNumber: {
          studentProfileId: studentId,
          semesterNumber
        }
      },
      update: {
        totalMarks,
        percentage,
        grade,
        status: percentage >= 40 ? "PASSED" : "FAILED"
      },
      create: {
        studentProfileId: studentId,
        semesterNumber,
        totalMarks,
        percentage,
        grade,
        status: percentage >= 40 ? "PASSED" : "FAILED"
      }
    });

    // Delete old marks and insert new
    await db.studentMarks.deleteMany({
      where: { studentSemesterId: semester.id }
    });

    await db.studentMarks.createMany({
      data: marksData.map(m => ({
        studentSemesterId: semester.id,
        unitName: m.unitName,
        marksObtained: m.marksObtained,
        maxMarks: 100
      }))
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markStudentsAsPrinted(studentIds: string[]) {
  try {
    await db.studentProfile.updateMany({
      where: { id: { in: studentIds } },
      data: { documentsPrinted: true }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markStudentsAsNotPrinted(studentIds: string[]) {
  try {
    await db.studentProfile.updateMany({
      where: { id: { in: studentIds } },
      data: { documentsPrinted: false }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestDocumentIssue(studentId: string) {
  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        course: true,
        semesters: {
          include: { marks: true }
        },
        workspace: true
      }
    });

    if (!student || !student.course) {
      return { success: false, error: "Student or course not found." };
    }

    // Validate marks
    let topicsObj: any = null;
    if (student.course.topics) {
      if (typeof student.course.topics === 'string') {
        try { topicsObj = JSON.parse(student.course.topics); } catch(e) {}
      } else {
        topicsObj = student.course.topics;
      }
    }

    if (!topicsObj || Object.keys(topicsObj).length === 0) {
      return { success: false, error: "Course topics not configured properly." };
    }

    // 1. Time Gap Validation
    if (student.course.duration) {
      const gapCheck = isValidIssueGap(student.admissionDate, student.course.duration);
      if (!gapCheck.valid) {
        return { success: false, error: `Minimum course duration not met. Certificate request can be made after ${gapCheck.requiredDate.toLocaleDateString('en-GB')}` };
      }
    }

    // 2. Marksheet Count Validation
    const semesters = Object.keys(topicsObj);
    if (student.course.duration) {
       const requiredCount = getRequiredMarksheetCount(student.course.duration);
       if (semesters.length < requiredCount) {
         return { success: false, error: `Course requires ${requiredCount} marksheets but only ${semesters.length} are configured in topics.` };
       }
    }

    for (let i = 0; i < semesters.length; i++) {
      const semKey = semesters[i];
      const semNumber = i + 1;
      const semData = topicsObj[semKey]; 
      
      const studentSem = student.semesters.find(s => s.semesterNumber === semNumber);
      if (!studentSem) {
        return { success: false, error: `Marks for Semester ${semNumber} are entirely missing.` };
      }

      for (let j = 0; j < semData.length; j++) {
        const expectedUnitName = `Unit ${j + 1}`;
        const hasMark = studentSem.marks.some(m => m.unitName === expectedUnitName);
        if (!hasMark) {
          return { success: false, error: `Missing marks for ${expectedUnitName} in Semester ${semNumber}. Please fill all marks before requesting issue.` };
        }
      }
    }

    // Update requestedAt
    await db.studentProfile.update({
      where: { id: studentId },
      data: { documentIssueRequestedAt: new Date() }
    });

    // Create Notification for Super Admin (userId = null is broadcast to global admins)
    await db.notification.create({
      data: {
        title: "Certificate Issue Requested",
        message: `Franchise admin (${student.workspace.name}) requested immediate certificate issue for student: ${student.fullName} (${student.enrollmentNo}).`,
        type: "APPLICATION",
        link: "/super-admin/students",
        workspaceId: null 
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to request document issue" };
  }
}
