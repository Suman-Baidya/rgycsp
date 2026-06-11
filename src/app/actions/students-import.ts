"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function importStudentsCSV(workspaceId: string, students: any[]) {
  try {
    if (!students || students.length === 0) {
      return { success: false, error: "No student records provided." };
    }

    const defaultPasswordHash = await bcrypt.hash("123456", 10);
    let successCount = 0;
    const errors: string[] = [];

    // Run within a database transaction or map sequentially to ensure safety and logging
    for (let i = 0; i < students.length; i++) {
      const record = students[i];
      const rowNum = i + 1;

      try {
        const fullName = record.fullName?.trim() || record.FullName?.trim();
        if (!fullName) {
          errors.push(`Row ${rowNum}: Full Name is required.`);
          continue;
        }

        const phone = record.phone?.trim() || record.Phone?.trim() || null;
        const email = record.email?.trim() || record.Email?.trim() || null;
        const whatsapp = record.whatsapp?.trim() || record.Whatsapp?.trim() || phone;
        const dobStr = record.dob?.trim() || record.DOB?.trim() || record["Date of Birth"]?.trim() || null;
        const genderRaw = record.gender?.trim() || record.Gender?.trim() || null;
        const religion = record.religion?.trim() || record.Religion?.trim() || null;
        const caste = record.caste?.trim() || record.Caste?.trim() || null;
        const bloodGroup = record.bloodGroup?.trim() || record.BloodGroup?.trim() || record["Blood Group"]?.trim() || null;
        const address = record.address?.trim() || record.Address?.trim() || null;
        const parentName = record.parentName?.trim() || record.ParentName?.trim() || record["Parent Name"]?.trim() || null;
        const parentPhone = record.parentPhone?.trim() || record.ParentPhone?.trim() || record["Parent Phone"]?.trim() || null;
        let enrollmentNo = record.enrollmentNo?.trim() || record.EnrollmentNo?.trim() || record["Enrollment No"]?.trim() || null;

        // Generate enrollment number if not provided
        if (!enrollmentNo) {
          let unique = false;
          let attempts = 0;
          while (!unique && attempts < 100) {
            const rand = Math.floor(1000 + Math.random() * 9000);
            const candidate = `STU-${rand}`;
            const existing = await db.studentProfile.findFirst({
              where: { workspaceId, enrollmentNo: candidate }
            });
            if (!existing) {
              enrollmentNo = candidate;
              unique = true;
            }
            attempts++;
          }
        }

        if (!enrollmentNo) {
          errors.push(`Row ${rowNum}: Failed to generate unique enrollment number.`);
          continue;
        }

        // Verify if enrollmentNo is unique in this workspace
        const existingStudent = await db.studentProfile.findFirst({
          where: { workspaceId, enrollmentNo }
        });

        if (existingStudent) {
          errors.push(`Row ${rowNum}: Enrollment number "${enrollmentNo}" is already in use in this workspace.`);
          continue;
        }

        // Parse date of birth
        let dob: Date | null = null;
        if (dobStr) {
          // Attempt parsing DD/MM/YYYY
          const dmy = dobStr.split(/[-/]/);
          if (dmy.length === 3) {
            let day = parseInt(dmy[0]);
            let month = parseInt(dmy[1]) - 1;
            let year = parseInt(dmy[2]);
            // check if formatted YYYY-MM-DD instead
            if (dmy[0].length === 4) {
              year = parseInt(dmy[0]);
              month = parseInt(dmy[1]) - 1;
              day = parseInt(dmy[2]);
            }
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              dob = date;
            }
          } else {
            const date = new Date(dobStr);
            if (!isNaN(date.getTime())) {
              dob = date;
            }
          }
        }

        // Normalize gender
        let gender = "OTHER";
        if (genderRaw) {
          const lower = genderRaw.toLowerCase();
          if (lower.startsWith("m")) gender = "MALE";
          else if (lower.startsWith("f")) gender = "FEMALE";
        }

        // Create User account for student login
        const user = await db.user.create({
          data: {
            name: fullName,
            username: enrollmentNo,
            email: email || undefined,
            passwordHash: defaultPasswordHash,
            role: "USER"
          }
        });

        // Create WorkspaceRole for student
        await db.workspaceRole.create({
          data: {
            userId: user.id,
            workspaceId,
            role: "STUDENT"
          }
        });

        // Create Student Profile
        await db.studentProfile.create({
          data: {
            workspaceId,
            userId: user.id,
            fullName,
            enrollmentNo,
            dob,
            gender,
            phone,
            email,
            whatsapp,
            parentName,
            parentPhone,
            address,
            bloodGroup,
            religion,
            caste
          }
        });

        successCount++;
      } catch (err: any) {
        console.error(`Error importing student at row ${rowNum}:`, err);
        errors.push(`Row ${rowNum}: Failed to import due to database error - ${err.message || err}`);
      }
    }

    revalidatePath(`/app/[tenant]/admin/students`, "page");

    return {
      success: successCount > 0,
      importedCount: successCount,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error: any) {
    console.error("Bulk student import failed:", error);
    return { success: false, error: error.message || "Failed to process import." };
  }
}
