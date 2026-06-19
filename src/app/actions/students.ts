"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStudents(workspaceId: string) {
  try {
    const students = await db.studentProfile.findMany({
      where: { workspaceId },
      include: {
        batch: {
          select: { name: true }
        },
        admissionApp: {
          select: { appliedCourse: true, createdAt: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: students };
  } catch (error: any) {
    console.error("Failed to fetch students:", error);
    return { success: false, error: error.message || "Failed to fetch students" };
  }
}

export async function createStudent(workspaceId: string, data: any) {
  try {
    const { 
      fullName, enrollmentNo, phone, email, whatsapp, 
      dob, gender, religion, caste, bloodGroup, address,
      parentName, parentPhone, fatherName, motherName, guardianPhone, batchId, qualification 
    } = data;

    const student = await db.studentProfile.create({
      data: {
        workspaceId,
        fullName,
        enrollmentNo,
        phone,
        email,
        whatsapp,
        dob: dob ? new Date(dob) : null,
        gender,
        religion,
        caste,
        bloodGroup,
        address,
        parentName,
        parentPhone,
        fatherName,
        motherName,
        guardianPhone,
        batchId: batchId === "none" ? null : (batchId || null),
        qualification: qualification || null,
      }
    });

    revalidatePath(`/app/[tenant]/admin/students`, "page");
    return { success: true, data: student };
  } catch (error: any) {
    console.error("Failed to create student:", error);
    return { success: false, error: error.message || "Failed to create student" };
  }
}

export async function updateStudent(id: string, data: any) {
  try {
    const { 
      fullName, enrollmentNo, phone, email, whatsapp, 
      dob, gender, religion, caste, bloodGroup, address,
      parentName, parentPhone, fatherName, motherName, guardianPhone, batchId, qualification 
    } = data;

    const student = await db.studentProfile.update({
      where: { id },
      data: {
        fullName,
        enrollmentNo,
        phone,
        email,
        whatsapp,
        dob: dob ? new Date(dob) : null,
        gender,
        religion,
        caste,
        bloodGroup,
        address,
        parentName,
        parentPhone,
        fatherName,
        motherName,
        guardianPhone,
        batchId: batchId === "none" ? null : (batchId || null),
        qualification: qualification || null,
      }
    });

    revalidatePath(`/app/[tenant]/admin/students`, "page");
    return { success: true, data: student };
  } catch (error: any) {
    console.error("Failed to update student:", error);
    return { success: false, error: error.message || "Failed to update student" };
  }
}
