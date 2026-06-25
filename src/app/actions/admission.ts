"use server";

import { db } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Upgrade password generation: 12 chars, random mix
function generateSecurePassword() {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const nums = "23456789";
  const symbols = "@#$!%";
  const all = upper + lower + nums + symbols;
  
  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += nums[Math.floor(Math.random() * nums.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 0; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export async function sendAdmissionOTP(email: string) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: otp } },
      update: { expires },
      create: { identifier: email, token: otp, expires }
    });

    await sendOTPEmail(email, otp);
    return { success: true };
  } catch (error: any) {
    console.error("OTP Send Error:", error);
    return { success: false, error: error?.message || "Failed to send OTP" };
  }
}

export async function verifyAdmissionOTP(email: string, otp: string): Promise<{ success: boolean, error?: string }> {
  try {
    const token = await db.verificationToken.findFirst({
      where: { identifier: email, token: otp }
    });

    if (!token || token.expires < new Date()) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    // Delete token after successful verification
    await db.verificationToken.delete({
      where: { token: otp }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Verification failed" };
  }
}


export async function submitAdmissionApplication(workspaceId: string, data: any, fromGlobal: boolean = false): Promise<{ success: boolean, error?: string, data?: any }> {
  try {
    // Generate meaningful application ID (e.g. SUMAN12345)
    const namePart = data.fullName.replace(/\s/g, '').substring(0, 5).toUpperCase().padEnd(5, 'X');
    const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
    const applicationNo = `${namePart}${randomDigits}`;
    
    // Parse DOB for database
    const [d, m, y] = data.dob.split('/');
    const dobDate = new Date(`${y}-${m}-${d}`);
    
    // Generate secure unpredictable password
    const tempPassword = generateSecurePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 1. Check if user exists by email (if email provided)
    let user;
    if (data.email) {
      user = await db.user.findUnique({
        where: { email: data.email }
      });
    }

    if (!user) {
      // Create new user if doesn't exist
      user = await db.user.create({
        data: {
          name: data.fullName,
          username: applicationNo,
          email: data.email,
          passwordHash: passwordHash,
          role: "USER"
        }
      });
    } else {
      // If user exists, ensure they have a username (student login)
      if (!user.username) {
        await db.user.update({
          where: { id: user.id },
          data: { username: applicationNo }
        });
      }
    }

    // 2. Create Application linked to User
    const application = await db.admissionApplication.create({
      data: {
        applicationNo,
        workspaceId,
        courseId: data.courseId || null,
        appliedCourse: data.appliedCourse,
        fullName: data.fullName,
        guardianName: data.guardianName,
        fatherName: data.fatherName,
        motherName: data.motherName,
        guardianPhone: data.guardianPhone,
        dob: dobDate,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        religion: data.religion,
        caste: data.caste,
        address: data.address,
        mobile: data.mobile,
        whatsapp: data.whatsapp,
        email: data.email,
        qualification: data.qualification,
        customData: data.customData || {},
        photoUrl: data.photoUrl,
        signatureUrl: data.signatureUrl,
        idProofUrl: data.idProofUrl,
        tempPassword: tempPassword,
        status: "PENDING",
      } as any
    });

    // 3. Create WorkspaceRole as STUDENT (optional but good for context)
    await db.workspaceRole.create({
      data: {
        userId: user.id,
        workspaceId,
        role: "STUDENT"
      }
    });

    // Create Notification for Admin
    await db.notification.create({
      data: {
        workspaceId,
        title: "New Admission Application",
        message: `A new admission application (${applicationNo}) has been submitted by ${data.fullName}.`,
        type: "APPLICATION",
        link: `/admin/students/applications/${application.id}`,
      }
    });

    if (fromGlobal) {
      // Notify Super Admin
      await db.notification.create({
        data: {
          workspaceId: null, // Super Admin
          title: "Global Portal Admission",
          message: `${data.fullName} enrolled in ${data.appliedCourse} via the Global Portal. Assigned to center ID: ${workspaceId}.`,
          type: "APPLICATION",
          link: `/super-admin/students`,
        }
      });
    }

    revalidatePath(`/app/[tenant]/admin`, "layout");
    revalidatePath(`/app/[tenant]/admin/admissions`);

    return { 
      success: true, 
      data: { 
        applicationNo, 
        tempPassword,
        id: application.id
      } 
    };
  } catch (error: any) {
    console.error("Error submitting application:", error);
    const errorMessage = error?.message || "Failed to submit application. Please try again.";
    return { success: false, error: errorMessage };
  }
}

export async function checkApplicationStatus(workspaceId: string, applicationNo: string, tempPassword: string) {
  try {
    const application = await db.admissionApplication.findFirst({
      where: {
        workspaceId,
        applicationNo,
        tempPassword
      }
    });

    if (!application) {
      return { success: false, error: "Invalid Application ID or Password" };
    }

    return { success: true, data: application };
  } catch (error) {
    console.error("Error checking status:", error);
    return { success: false, error: "An error occurred while fetching application status." };
  }
}


export async function updateApplicationStatus(id: string, status: string, rejectionReason?: string, batchId?: string) {
  try {
    const application = await db.admissionApplication.update({
      where: { id },
      data: {
        status: status as any,
        rejectionReason: rejectionReason || null
      },
      include: {
        workspace: true
      }
    });

    if (status === "APPROVED") {
      // Logic to create StudentProfile
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000).toString();
      const enrollmentNo = `ENR-${year}-${random}`;

      // Create or update User for login
      if (!application.tempPassword) {
        throw new Error("Temporary password not found for this application.");
      }
      const passwordHash = await bcrypt.hash(application.tempPassword, 10);
      
      const user = await db.user.upsert({
        where: { username: application.applicationNo },
        update: {
          name: application.fullName!,
          passwordHash: passwordHash
        },
        create: {
          name: application.fullName!,
          username: application.applicationNo!,
          email: application.email,
          passwordHash: passwordHash,
          role: "USER"
        }
      });

      // Create Workspace Role
      await db.workspaceRole.upsert({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: application.workspaceId
          }
        },
        update: {
          role: "STUDENT"
        },
        create: {
          userId: user.id,
          workspaceId: application.workspaceId,
          role: "STUDENT"
        }
      });

      // Create/Update StudentProfile and link to User
      await db.studentProfile.upsert({
        where: { applicationId: application.id },
        update: {
          userId: user.id,
          enrollmentNo: enrollmentNo!,
          batchId: batchId || null
        },
        create: {
          workspaceId: application.workspaceId,
          userId: user.id,
          fullName: application.fullName!,
          enrollmentNo: enrollmentNo!,
          dob: application.dob,
          gender: application.gender,
          bloodGroup: application.bloodGroup,
          fatherName: application.fatherName,
          motherName: application.motherName,
          guardianPhone: application.guardianPhone,
          religion: application.religion,
          caste: application.caste,
          email: application.email,
          whatsapp: application.whatsapp,
          parentName: application.guardianName,
          qualification: application.qualification ? (application.qualification as any) : null,
          phone: application.mobile!,
          address: application.address ? (JSON.stringify(application.address) as any) : null,
          admissionDate: new Date(),
          applicationId: application.id,
          batchId: batchId || null,
          courseId: application.courseId || null,
          photoUrl: application.photoUrl || null,
          signatureUrl: application.signatureUrl || null,
          idProofUrl: application.idProofUrl || null,
          status: "UNREGISTERED",
        }
      });

      // Notify the applicant
      await db.notification.create({
        data: {
          workspaceId: application.workspaceId,
          title: "Admission Approved!",
          message: `Congratulations ${application.fullName}, your admission for ${application.appliedCourse} has been approved. You can now login with your Application No.`,
          type: "APPLICATION",
          link: `/admission/status`
        }
      });
    }

    revalidatePath(`/app/[tenant]/admin`, "layout");
    revalidatePath(`/app/[tenant]/admin/admissions`);
    revalidatePath(`/app/[tenant]/admin/students`);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating status:", error);
    return { success: false, error: error?.message || "Failed to update application status." };
  }
}


