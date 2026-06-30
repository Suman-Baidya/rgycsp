"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function issueStudentDocument(studentId: string, documentType: "MARKSHEET" | "CERTIFICATE" | "STUDENT_ID" | "ADMIT_CARD", status: boolean) {
  try {
    let data: any = {};
    switch (documentType) {
      case "MARKSHEET": data = { marksheetApproved: status }; break;
      case "CERTIFICATE": data = { certificateApproved: status }; break;
      case "STUDENT_ID": data = { registrationCardApproved: status }; break;
      case "ADMIT_CARD": data = { admitCardApproved: status }; break;
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
