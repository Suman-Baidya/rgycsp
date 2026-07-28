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
      photoUrl, signatureUrl, idProofUrl, loginPassword, marksheetNo, certificateNo, registrationNo, admissionDate
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

    let finalRegistrationNo = existing.registrationNo;
    let autoResolvedConflict = false;

    if (admissionDate) {
      updateData.admissionDate = new Date(admissionDate);
      
      if (existing.registrationNo) {
        const newYearStr = updateData.admissionDate.getFullYear().toString();
        const yIndex = existing.registrationNo.indexOf('Y');
        
        if (yIndex !== -1 && yIndex + 5 <= existing.registrationNo.length) {
          const prefixBeforeYear = existing.registrationNo.substring(0, yIndex + 1);
          const currentYearPart = existing.registrationNo.substring(yIndex + 1, yIndex + 5);
          const currentSuffix = existing.registrationNo.substring(yIndex + 5);
          
          if (currentYearPart !== newYearStr) {
            let autoRegNo = `${prefixBeforeYear}${newYearStr}${currentSuffix}`;
            
            // Conflict resolution loop
            let testRegNo = autoRegNo;
            let currentSeq = parseInt(testRegNo.slice(-5), 10);
            let series = testRegNo.slice(-6, -5);
            
            while (true) {
              const checkProfile = await db.studentProfile.findUnique({ where: { registrationNo: testRegNo } });
              const checkReg = await db.studentRegistration.findUnique({ where: { registrationNo: testRegNo } });
              
              if ((checkProfile && checkProfile.id !== id) || (checkReg && checkReg.studentProfileId !== id)) {
                currentSeq++;
                const newSeqStr = String(currentSeq).padStart(5, '0');
                testRegNo = `${prefixBeforeYear}${newYearStr}${series}${newSeqStr}`;
              } else {
                break;
              }
            }
            finalRegistrationNo = testRegNo;
            autoResolvedConflict = true;
          }
        }
      }
    }

    if (registrationNo && registrationNo !== existing.registrationNo) {
      if (!existing.registrationNo) {
        return { success: false, error: "Cannot manually add a registration number to a student who is not yet registered. Please use the registration process." };
      }

      // Check if user is trying to manually change it while auto-resolver also changed it
      if (autoResolvedConflict && registrationNo !== finalRegistrationNo) {
        // Enforce they match the new year
        const yIndex = existing.registrationNo.indexOf('Y');
        const expectedPrefix = `${existing.registrationNo.substring(0, yIndex + 1)}${updateData.admissionDate.getFullYear()}`;
        if (!registrationNo.startsWith(expectedPrefix)) {
          return { success: false, error: `The registration number's year must match the admission date year. Expected prefix: '${expectedPrefix}'` };
        }
      } else {
        // Normal manual edit without admission date change
        if (registrationNo.length !== existing.registrationNo.length) {
           return { success: false, error: "The new registration number must maintain the same length and format." };
        }

        const originalPrefix = existing.registrationNo.slice(0, -6);
        const newPrefix = registrationNo.slice(0, -6);
        const newSuffix = registrationNo.slice(-6);

        if (originalPrefix !== newPrefix) {
          return { success: false, error: `You are only allowed to change the last 6 characters. The prefix must remain '${originalPrefix}'.` };
        }

        if (!/^[A-Z]\d{5}$/.test(newSuffix)) {
          return { success: false, error: "The last 6 characters must be exactly 1 uppercase letter followed by a 5-digit number (e.g., B00001)." };
        }
      }

      const existingInProfile = await db.studentProfile.findUnique({ where: { registrationNo } });
      const existingInReg = await db.studentRegistration.findUnique({ where: { registrationNo } });
      
      if ((existingInProfile && existingInProfile.id !== id) || 
          (existingInReg && existingInReg.studentProfileId !== id)) {
        return { success: false, error: "This Registration Number is already assigned to another student (including passouts)." };
      }
      finalRegistrationNo = registrationNo;
    }
    
    if (finalRegistrationNo && finalRegistrationNo !== existing.registrationNo) {
      updateData.registrationNo = finalRegistrationNo;
    }

    // Wrap in transaction to update both Profile and Registration if needed
    const student = await db.$transaction(async (tx) => {
      const updatedProfile = await tx.studentProfile.update({
        where: { id },
        data: updateData
      });

      if (updateData.registrationNo && existing.registrationNo && updateData.registrationNo !== existing.registrationNo) {
        // Update the registration record too if it exists
        await tx.studentRegistration.updateMany({
          where: { studentProfileId: id, registrationNo: existing.registrationNo },
          data: { registrationNo: updateData.registrationNo }
        });
      }

      return updatedProfile;
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