"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDocumentTemplates(workspaceId: string | null = null) {
  try {
    return await db.documentTemplate.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
}

export async function saveDocumentTemplate(data: {
  id?: string;
  name: string;
  type: string;
  background?: string | null;
  width: number;
  height: number;
  config: any;
  workspaceId?: string | null;
}) {
  try {
    const { id, ...payload } = data;
    
    if (id) {
      await db.documentTemplate.update({
        where: { id },
        data: payload
      });
      revalidatePath("/super-admin/documents");
      return { success: true, id };
    } else {
      const newTemplate = await db.documentTemplate.create({
        data: payload
      });
      revalidatePath("/super-admin/documents");
      return { success: true, id: newTemplate.id };
    }
  } catch (error: any) {
    console.error("Failed to save template:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDocumentTemplate(id: string) {
  try {
    await db.documentTemplate.delete({
      where: { id }
    });
    revalidatePath("/super-admin/documents");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete template:", error);
    return { success: false, error: error.message };
  }
}
