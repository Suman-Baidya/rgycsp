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
          registrationSeries: "B",
          autoDocumentIssueEnabled: false,
          autoMarksheetDays: 2,
          autoCertificateDays: 30,
          autoIssueAfterRequestHours: 1,
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
  registrationSeries: string;
  autoDocumentIssueEnabled?: boolean;
  autoMarksheetDays?: number;
  autoCertificateDays?: number;
  autoIssueAfterRequestHours?: number;
}) {
  try {
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
