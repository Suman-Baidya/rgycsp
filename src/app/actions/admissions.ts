"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Register a single student manually
 */
export async function registerStudentAction(workspaceId: string, data: any) {
  try {
    const namePart = data.fullName.replace(/\s/g, '').substring(0, 5).toUpperCase().padEnd(5, 'X');
    const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
    const applicationNo = `${namePart}${randomDigits}`;
    
    // Create Admission Application
    const application = await db.admissionApplication.create({
      data: {
        workspaceId,
        applicationNo,
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email || null,
        courseId: data.courseId || null,
        status: "APPROVED",
        source: "MANUAL",
      }
    });

    // Create Student Profile directly
    const count = await db.studentProfile.count({ where: { workspaceId } });
    const enrollmentNo = `ENR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const student = await db.studentProfile.create({
      data: {
        workspaceId,
        applicationId: application.id,
        fullName: data.fullName,
        phone: data.mobile,
        email: data.email || null,
        enrollmentNo,
        batchId: data.batchId || null,
        status: "UNREGISTERED",
      }
    });

    if (data.fees && parseFloat(data.fees) > 0) {
      await db.invoice.create({
        data: {
          workspaceId,
          studentProfileId: student.id,
          amount: parseFloat(data.fees),
          status: "PENDING",
          dueDate: new Date(),
          notes: "Admission Fee"
        }
      });
    }

    revalidatePath(`/app/[tenant]/admin/admissions`, "layout");
    return { success: true, studentId: student.id };
  } catch (error: any) {
    console.error("Manual registration error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk import students from CSV data
 */
export async function bulkRegisterStudentsAction(workspaceId: string, studentsData: any[]) {
  try {
    let successCount = 0;
    
    for (const data of studentsData) {
      if (!data.fullName || (!data.mobile && !data.email)) continue;

      const namePart = data.fullName.replace(/\s/g, '').substring(0, 5).toUpperCase().padEnd(5, 'X');
      const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
      const applicationNo = `${namePart}${randomDigits}`;

      // Create them as PENDING applications from CSV
      await db.admissionApplication.create({
        data: {
          workspaceId,
          applicationNo,
          fullName: data.fullName,
          mobile: data.mobile || "",
          email: data.email || null,
          courseId: data.courseId || null,
          status: "PENDING",
          source: "CSV",
          customData: {
            intendedBatchId: data.batchId || null,
            intendedFees: data.fees || null
          }
        }
      });
      
      successCount++;
    }

    revalidatePath(`/app/[tenant]/admin/admissions`, "layout");
    revalidatePath(`/app/[tenant]/admin`, "layout");
    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Bulk registration error:", error);
    return { success: false, error: error.message };
  }
}
