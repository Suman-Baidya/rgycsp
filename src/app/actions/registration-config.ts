"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRegistrationConfig() {
  try {
    let config = await db.registrationConfig.findFirst();
    if (!config) {
      config = await db.registrationConfig.create({
        data: {
          enrollmentPrefix: "RGY",
          enrollmentDigits: 6,
          registrationSeries: "B",
          certificatePrefix: "CERT",
          certificateDigits: 4,
          marksheetPrefix: "MS",
          marksheetDigits: 4,
          autoMarksheetIssueEnabled: false,
          autoCertificateIssueEnabled: false,
          autoQuickIssueEnabled: false,
          autoMarksheetDays: 2,
          autoCertificateDays: 30,
          autoIssueAfterRequestMinutes: 60,
        }
      });
    }
    return config;
  } catch (error) {
    console.error("Error fetching registration config:", error);
    return null;
  }
}

export async function updateRegistrationConfig(data: { 
  enrollmentPrefix: string; 
  enrollmentDigits?: number;
  registrationSeries: string;
  certificatePrefix: string;
  certificateDigits?: number;
  marksheetPrefix: string;
  marksheetDigits?: number;
  autoMarksheetIssueEnabled?: boolean;
  autoCertificateIssueEnabled?: boolean;
  autoQuickIssueEnabled?: boolean;
  autoMarksheetDays?: number;
  autoCertificateDays?: number;
  autoIssueAfterRequestMinutes?: number;
}) {
  try {
    if (data.enrollmentDigits !== undefined) {
      if (data.enrollmentDigits < 6) data.enrollmentDigits = 6;
      if (data.enrollmentDigits > 12) data.enrollmentDigits = 12;
    }
    if (data.certificateDigits !== undefined) {
      if (data.certificateDigits < 3) data.certificateDigits = 3;
      if (data.certificateDigits > 10) data.certificateDigits = 10;
    }
    if (data.marksheetDigits !== undefined) {
      if (data.marksheetDigits < 3) data.marksheetDigits = 3;
      if (data.marksheetDigits > 10) data.marksheetDigits = 10;
    }
    const config = await db.registrationConfig.findFirst();
    if (config) {
      await db.registrationConfig.update({
        where: { id: config.id },
        data
      });
    } else {
      await db.registrationConfig.create({
        data
      });
    }
    revalidatePath("/super-admin/students");
    return { success: true, message: "Configuration updated successfully." };
  } catch (error: any) {
    console.error("Error updating registration config:", error);
    return { success: false, error: error.message || "Failed to update configuration." };
  }
}
