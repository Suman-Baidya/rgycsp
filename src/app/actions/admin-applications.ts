"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function getAdmissionApplications(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const apps = await db.admissionApplication.findMany({
      where: { workspaceId },
      include: {
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: apps };
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return { success: false, error: "Failed to fetch applications." };
  }
}

export async function deleteApplication(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    await db.admissionApplication.delete({
      where: { id: applicationId }
    });
    revalidatePath(`/app/[tenant]/admin/students/applications`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return { success: false, error: "Failed to delete application." };
  }
}

export async function getApplicationDetails(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const app = await db.admissionApplication.findUnique({
      where: { id: applicationId },
      include: {
        course: { select: { title: true } }
      }
    });
    return { success: true, data: app };
  } catch (error: any) {
    console.error("Error fetching application details:", error);
    return { success: false, error: "Failed to fetch application details." };
  }
}

export async function approveApplication(applicationId: string, batchId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const application = await db.admissionApplication.findUnique({
      where: { id: applicationId },
      include: { course: true }
    });

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    if (application.status === "APPROVED") {
      return { success: false, error: "Already approved." };
    }

    const workspace = await db.workspace.findUnique({
      where: { id: application.workspaceId }
    });

    if (!workspace) {
      return { success: false, error: "Workspace not found." };
    }

    // Wrap in transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Update application status
      const updatedApp = await tx.admissionApplication.update({
        where: { id: applicationId },
        data: { status: "APPROVED" }
      });

      // 2. Generate Enrollment No and Password
      const config = await tx.registrationConfig.findFirst();
      const prefix = config ? config.enrollmentPrefix : "RGY";
      const digits = config?.enrollmentDigits || 6;
      const globalCount = await tx.studentProfile.count();
      const enrollmentNo = `${prefix}${String(globalCount + 1).padStart(digits, '0')}`;

      let loginPassword = "";
      if (application.dob) {
        const dobDate = new Date(application.dob);
        const yyyy = dobDate.getFullYear();
        let fname = application.fullName.split(' ')[0];
        fname = fname.charAt(0).toUpperCase() + fname.slice(1).toLowerCase();
        loginPassword = `${fname}${yyyy}`;
      }

      let userId = null;
      if (loginPassword) {
        const passwordHash = await bcrypt.hash(loginPassword, 10);
        const newUser = await tx.user.create({
          data: {
            username: enrollmentNo,
            name: application.fullName,
            passwordHash,
            role: 'USER'
          }
        });
        userId = newUser.id;
      }

      // 3. Create StudentProfile
      const student = await tx.studentProfile.create({
        data: {
          workspaceId: application.workspaceId,
          userId,
          batchId: batchId || null,
          courseId: application.courseId,
          applicationId: application.id,
          fullName: application.fullName,
          enrollmentNo: enrollmentNo,
          loginPassword: loginPassword || null,
          dob: application.dob,
          gender: application.gender,
          phone: application.mobile,
          email: application.email || null,
          parentName: application.guardianName,
          parentPhone: application.mobile, // Optional mapping
          address: typeof application.address === 'object' ? JSON.stringify(application.address) : null,
          bloodGroup: null,
          admissionDate: new Date(),
          status: "UNREGISTERED", // Explicitly setting status
          paymentType: application.paymentType || "ONE_TIME"
        }
      });

      // 4. Generate Invoices if course pricing exists
      if (application.courseId) {
        const localCourse = await tx.course.findUnique({ where: { id: application.courseId } });
        if (localCourse) {
          const now = new Date();
          
          if (localCourse.admissionFee > 0) {
            await tx.invoice.create({
              data: {
                workspaceId: application.workspaceId,
                studentProfileId: student.id,
                amount: localCourse.admissionFee,
                status: "PENDING",
                dueDate: now,
                feeType: "ADMISSION",
                notes: "Admission Fee"
              }
            });
          }

          if (localCourse.registrationFee > 0) {
            await tx.invoice.create({
              data: {
                workspaceId: application.workspaceId,
                studentProfileId: student.id,
                amount: localCourse.registrationFee,
                status: "PENDING",
                dueDate: now,
                feeType: "REGISTRATION",
                notes: "Registration Fee"
              }
            });
          }

          if (localCourse.examFee > 0) {
            const nextMonth = new Date();
            nextMonth.setMonth(now.getMonth() + 1);
            await tx.invoice.create({
              data: {
                workspaceId: application.workspaceId,
                studentProfileId: student.id,
                amount: localCourse.examFee,
                status: "PENDING",
                dueDate: nextMonth, // due a bit later
                feeType: "EXAM",
                notes: "Exam Fee"
              }
            });
          }

          const isEmi = application.paymentType === "EMI" && localCourse.isInstallmentBased;
          
          if (isEmi && localCourse.installmentAmount && localCourse.totalInstallments) {
            // Generate EMIs
            for (let i = 1; i <= localCourse.totalInstallments; i++) {
              const emiDate = new Date();
              emiDate.setMonth(now.getMonth() + i); // 1st EMI due next month
              await tx.invoice.create({
                data: {
                  workspaceId: application.workspaceId,
                  studentProfileId: student.id,
                  amount: localCourse.installmentAmount,
                  status: "PENDING",
                  dueDate: emiDate,
                  feeType: "INSTALLMENT",
                  installmentNo: i,
                  notes: `EMI Installment ${i} of ${localCourse.totalInstallments}`
                }
              });
            }
          } else if (localCourse.totalCourseFee > 0) {
            // Generate One-Time Full Course Fee
            await tx.invoice.create({
              data: {
                workspaceId: application.workspaceId,
                studentProfileId: student.id,
                amount: localCourse.totalCourseFee,
                status: "PENDING",
                dueDate: now,
                feeType: "FULL_COURSE",
                notes: "Total Course Fee (One-Time)"
              }
            });
          }
        }
      }

      return { student, updatedApp };
    });

    revalidatePath(`/app/[tenant]/admin/students`);
    revalidatePath(`/app/[tenant]/admin/students/applications`);
    revalidatePath(`/app/[tenant]/admin/admissions`);
    revalidatePath(`/app/[tenant]/admin`, "layout");
    
    return { success: true, data: result.student };
  } catch (error: any) {
    console.error("Error approving application:", error);
    return { success: false, error: "Failed to approve application." };
  }
}

export async function rejectApplication(applicationId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    await db.admissionApplication.update({
      where: { id: applicationId },
      data: { status: "REJECTED", rejectionReason: reason }
    });
    
    revalidatePath(`/app/[tenant]/admin/students/applications`);
    revalidatePath(`/app/[tenant]/admin/admissions`);
    revalidatePath(`/app/[tenant]/admin`, "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting application:", error);
    return { success: false, error: "Failed to reject application." };
  }
}

export async function getPendingApplicationsCount(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const count = await db.admissionApplication.count({
      where: { 
        workspaceId,
        status: "PENDING"
      }
    });
    return { success: true, data: count };
  } catch (error: any) {
    console.error("Error fetching pending count:", error);
    return { success: false, error: "Failed to fetch pending count." };
  }
}
