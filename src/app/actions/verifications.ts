"use server";

import { db } from "@/lib/prisma";
import { getDocumentStatus } from "@/lib/document-utils";

export async function verifyApplicationStatus(applicationNo: string) {
  try {
    const app = await db.admissionApplication.findUnique({
      where: { applicationNo },
      select: {
        fullName: true,
        status: true,
        course: { select: { title: true } },
        createdAt: true,
      }
    });

    if (!app) return { success: false, message: "Application not found." };
    
    return {
      success: true,
      data: {
        name: app.fullName,
        courseName: app.course?.title || "Unknown Course",
        status: app.status,
        date: app.createdAt.toISOString()
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function verifyRegistration(identifier: string) {
  try {
    const student = await db.studentProfile.findFirst({
      where: {
        AND: [
          {
            registrations: { some: { registrationNo: identifier } }
          },
          {
            OR: [
              { status: "REGISTERED" },
              { status: "PASS_OUT" }
            ]
          }
        ]
      },
      select: {
        fullName: true,
        enrollmentNo: true,
        registrations: {
          select: {
            registrationNo: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        course: {
          select: {
            title: true
          }
        },
        admissionDate: true,
        status: true
      }
    });

    if (!student) {
      return { success: false, message: "Valid registration not found." };
    }

    return {
      success: true,
      data: {
        name: student.fullName,
        enrollmentNo: student.enrollmentNo,
        registrationNo: student.registrations[0]?.registrationNo,
        courseName: student.course?.title,
        status: student.status,
        date: student.registrations[0]?.createdAt?.toISOString() || student.admissionDate.toISOString()
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function verifyCertificate(identifier: string) {
  try {
    const student = await db.studentProfile.findFirst({
      where: { 
        OR: [
          { certificateNo: identifier }, 
          { registrationNo: identifier },
          { registrations: { some: { registrationNo: identifier } } }
        ] 
      },
      select: {
        id: true,
        fullName: true,
        certificateNo: true,
        registrationNo: true,
        enrollmentNo: true,
        course: { select: { title: true } },
        certificateApproved: true,
        certificateIssuedToStudent: true,
        admissionDate: true,
        registrations: {
          select: { registrationNo: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!student) {
      return { success: false, message: "Student not found." };
    }

    const config = await db.registrationConfig.findFirst();
    const docStatus = getDocumentStatus(student as any, null, config);

    if (!docStatus.finalCertApproved) {
      return { success: false, message: "Valid certificate not found or not yet approved." };
    }
    
    return {
      success: true,
      data: {
        name: student.fullName,
        courseName: student.course?.title || "Unknown Course",
        enrollmentNo: student.enrollmentNo,
        certificateNo: student.certificateNo,
        registrationNo: student.registrationNo || student.registrations[0]?.registrationNo,
        date: student.admissionDate.toISOString()
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function verifyMarksheet(identifier: string) {
  try {
    // Look up by marksheetNo directly on StudentProfile, or fallback to registrationNo
    const student = await db.studentProfile.findFirst({
      where: { 
        OR: [
          { marksheetNo: identifier } as any,
          { registrationNo: identifier },
          { registrations: { some: { registrationNo: identifier } } }
        ]
      },
      include: {
        course: { select: { title: true } },
        semesters: {
          include: {
            marks: true
          }
        }
      }
    });

    if (!student || !student.semesters || student.semesters.length === 0) {
      return { success: false, message: "Valid marksheet not found." };
    }

    const config = await db.registrationConfig.findFirst();
    const docStatus = getDocumentStatus(student, student.semesters[0], config);

    if (!docStatus.finalMarksheetApproved) {
      return { success: false, message: "Valid marksheet not found or not yet approved." };
    }
    
    // Sort semesters by semesterNumber
    const approvedSemesters = [...student.semesters].sort((a, b) => a.semesterNumber - b.semesterNumber);

    // Get the latest semester to show as primary, or let the UI handle multiple semesters
    const latestSemester = approvedSemesters[approvedSemesters.length - 1];
    
    return {
      success: true,
      data: {
        name: student.fullName,
        courseName: student.course?.title || "Unknown Course",
        enrollmentNo: student.enrollmentNo,
        marksheetNo: (student as any).marksheetNo,
        registrationNo: student.registrationNo,
        semesterNumber: latestSemester.semesterNumber,
        totalMarks: latestSemester.totalMarks,
        percentage: latestSemester.percentage,
        grade: latestSemester.grade,
        date: latestSemester.marksFinalizedAt ? latestSemester.marksFinalizedAt.toISOString() : student.updatedAt.toISOString(),
        marks: latestSemester.marks.map((m: any) => ({
          unitName: m.unitName,
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks
        }))
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function verifyStudentId(identifier: string) {
  try {
    // The student must be active. (Checking StudentProfile schema for status)
    const student = await db.studentProfile.findFirst({
      where: { registrations: { some: { registrationNo: identifier } } },
      select: {
        fullName: true,
        enrollmentNo: true,
        course: { select: { title: true } },
        bloodGroup: true,
        admissionDate: true,
        status: true,
        registrations: {
          select: { registrationNo: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!student || student.status === 'UNREGISTERED') return { success: false, message: "Student ID not found or unregistered." };
    
    return {
      success: true,
      data: {
        name: student.fullName,
        courseName: student.course?.title || "Unknown Course",
        enrollmentNo: student.enrollmentNo,
        registrationNo: student.registrations[0]?.registrationNo,
        bloodGroup: student.bloodGroup,
        date: student.admissionDate.toISOString()
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function verifyAdmitCard(enrollmentNo: string, dobString: string) {
  try {
    // Ensure date is correctly parsed
    const parts = dobString.split('/');
    if (parts.length !== 3) return { success: false, message: "Invalid date format." };
    const dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD
    
    if (isNaN(dob.getTime())) return { success: false, message: "Invalid date format." };

    const student = await db.studentProfile.findFirst({
      where: { 
        enrollmentNo,
        dob: dob,
        admitCardApproved: true
      },
      select: {
        id: true,
        fullName: true,
        enrollmentNo: true,
        course: { select: { title: true } }
      }
    });

    if (!student) return { success: false, message: "Valid admit card not found. Ensure Date of Birth matches your records." };
    
    return {
      success: true,
      data: {
        id: student.id,
        name: student.fullName,
        courseName: student.course?.title || "Unknown Course",
        enrollmentNo: student.enrollmentNo
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
