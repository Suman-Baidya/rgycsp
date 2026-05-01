"use server";

import { db } from "@/lib/prisma";

export async function getAdmissionConfig(workspaceId: string) {
  try {
    let config = await db.admissionFormConfig.findUnique({
      where: { workspaceId },
    });

    if (!config) {
      config = await (db.admissionFormConfig as any).create({
        data: {
          workspaceId,
          disabledFields: [],
          instructions: "Please fill out the admission form carefully. Ensure all documents are clear and legible.",
          successMessage: "Your application has been submitted successfully. Please login to track your status.",
          declarationText: "I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.",
          requiredDocs: ["Passport Size Photo", "Identity Proof (Aadhaar/Voter)", "Last Qualification Marksheet"],
          enableEmailVerification: true,
          customFields: [],
        },
      });
    }

    return { success: true, data: config };
  } catch (error: any) {
    console.error("Error fetching admission config:", error);
    return { success: false, error: "Failed to fetch admission config." };
  }
}

export async function updateAdmissionConfig(workspaceId: string, data: any): Promise<{ success: boolean, error?: string, data?: any }> {
  try {
    if (!workspaceId) throw new Error("Workspace ID is required");

    const existing = await db.admissionFormConfig.findUnique({
      where: { workspaceId }
    });

    let updated;
    const updateData = {
      disabledFields: data.disabledFields || [],
      instructions: data.instructions || "",
      successMessage: data.successMessage || "",
      declarationText: data.declarationText || "",
      requiredDocs: data.requiredDocs || [],
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      enableEmailVerification: typeof data.enableEmailVerification === 'boolean' ? data.enableEmailVerification : true,
      customFields: data.customFields || [],
    };

    if (existing) {
      updated = await (db.admissionFormConfig as any).update({
        where: { workspaceId },
        data: updateData,
      });
    } else {
      updated = await (db.admissionFormConfig as any).create({
        data: {
          workspaceId,
          ...updateData,
        },
      });
    }

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating admission config:", error.message || error);
    return { success: false, error: error.message || "Failed to update admission config." };
  }
}
