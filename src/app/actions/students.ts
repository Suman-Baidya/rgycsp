"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function getStudents(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const students = await db.studentProfile.findMany({
      where: { workspaceId },
      include: {
        batch: {
          select: { name: true }
        },
        course: {
          select: { title: true, duration: true }
        },
        admissionApp: {
          select: { appliedCourse: true, createdAt: true, email: true, photoUrl: true, signatureUrl: true, idProofUrl: true }
        },
        registrations: true,
        semesters: { include: { marks: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: students };
  } catch (error: any) {
    console.error("Failed to fetch students:", error);
    return { success: false, error: error.message || "Failed to fetch students" };
  }
}

export async function getAllPlatformStudents() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") return { success: false, error: "Unauthorized" };

    const students = await db.studentProfile.findMany({
      include: {
        workspace: {
          select: { name: true, subdomain: true }
        },
        batch: {
          select: { name: true }
        },
        course: {
          select: { title: true, code: true, duration: true, globalCourse: { select: { short: true } } }
        },
        admissionApp: {
          select: { appliedCourse: true, createdAt: true, email: true, photoUrl: true, signatureUrl: true, idProofUrl: true }
        },
        registrations: true,
        semesters: { include: { marks: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: students };
  } catch (error: any) {
    console.error("Failed to fetch all platform students:", error);
    return { success: false, error: error.message || "Failed to fetch all platform students" };
  }
}

export async function createStudent(workspaceId: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const { 
      fullName, enrollmentNo, phone, email, whatsapp, 
      dob, gender, religion, caste, bloodGroup, address,
      parentName, parentPhone, fatherName, motherName, guardianPhone, batchId, courseId, qualification,
      photoUrl, signatureUrl, idProofUrl, loginPassword: providedPassword 
    } = data;

    // Generate Enrollment Number (e.g., RGY12345678)
    let finalEnrollmentNo = enrollmentNo;
    if (!finalEnrollmentNo) {
      const config = await db.registrationConfig.findFirst();
      const prefix = config ? config.enrollmentPrefix : "RGY";
      const count = await db.studentProfile.count();
      const seq = String(count + 1).padStart(8, '0');
      finalEnrollmentNo = `${prefix}${seq}`;
    }

    let loginPassword = providedPassword;
    if (!loginPassword && dob) {
      const dobDate = new Date(dob);
      const yyyy = dobDate.getFullYear();
      let fname = fullName.split(' ')[0];
      fname = fname.charAt(0).toUpperCase() + fname.slice(1).toLowerCase();
      loginPassword = `${fname}${yyyy}`;
    }

    let userId = null;
    if (loginPassword) {
      const passwordHash = await bcrypt.hash(loginPassword, 10);
      const newUser = await db.user.create({
        data: {
          username: finalEnrollmentNo,
          name: fullName,
          passwordHash,
          role: 'USER'
        }
      });
      userId = newUser.id;
    }

    const student = await db.studentProfile.create({
      data: {
        workspaceId,
        userId,
        fullName,
        enrollmentNo: finalEnrollmentNo,
        loginPassword: loginPassword || null,
        phone,
        email,
        whatsapp,
        dob: dob ? new Date(dob) : null,
        gender,
        religion,
        caste,
        bloodGroup,
        address,
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        fatherName,
        motherName,
        guardianPhone,
        batchId: batchId === "none" ? null : (batchId || null),
        courseId: courseId === "none" ? null : (courseId || null),
        qualification: qualification || null,
        photoUrl: photoUrl || null,
        signatureUrl: signatureUrl || null,
        idProofUrl: idProofUrl || null,
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
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    // Find student to verify access
    const existing = await db.studentProfile.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Student not found" };

    const { 
      fullName, enrollmentNo, phone, email, whatsapp, 
      dob, gender, religion, caste, bloodGroup, address,
      parentName, parentPhone, fatherName, motherName, guardianPhone, batchId, courseId, qualification,
      photoUrl, signatureUrl, idProofUrl, loginPassword, marksheetNo, certificateNo
    } = data;

    const updateData: any = {
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
      fatherName: fatherName || null,
      motherName: motherName || null,
      guardianPhone: guardianPhone || null,
      parentName: parentName || null,
      parentPhone: parentPhone || null,
      batchId: batchId === "none" ? null : (batchId || null),
      courseId: courseId === "none" ? null : (courseId || null),
      qualification: qualification || null,
      photoUrl: photoUrl || null,
      signatureUrl: signatureUrl || null,
      idProofUrl: idProofUrl || null,
    };
    if (loginPassword !== undefined) {
      updateData.loginPassword = loginPassword || null;
    }
    if (marksheetNo !== undefined) {
      updateData.marksheetNo = marksheetNo || null;
    }
    if (certificateNo !== undefined) {
      updateData.certificateNo = certificateNo || null;
    }

    const student = await db.studentProfile.update({
      where: { id },
      data: updateData
    });

    revalidatePath(`/app/[tenant]/admin/students`, "page");
    return { success: true, data: student };
  } catch (error: any) {
    console.error("Failed to update student:", error);
    return { success: false, error: error.message || "Failed to update student" };
  }
}

export async function adminUpdateStudentPassword(studentId: string, newPassword: string) {
  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    if (!student) return { success: false, error: 'Student not found' };
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db.$transaction(async (tx) => {
      let targetUserId = student.userId;

      if (!targetUserId && student.enrollmentNo) {
        const existingUser = await tx.user.findUnique({
          where: { username: student.enrollmentNo }
        });
        
        if (existingUser) {
          targetUserId = existingUser.id;
        } else {
          const newUser = await tx.user.create({
            data: {
              username: student.enrollmentNo,
              name: student.fullName,
              passwordHash,
              role: 'USER'
            }
          });
          targetUserId = newUser.id;
        }
      }

      await tx.studentProfile.update({
        where: { id: studentId },
        data: { 
          loginPassword: newPassword,
          ...(targetUserId && { userId: targetUserId })
        }
      });

      if (targetUserId) {
        await tx.user.update({
          where: { id: targetUserId },
          data: { passwordHash }
        });
      }
    });
    revalidatePath('/app/[tenant]/admin/students');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}