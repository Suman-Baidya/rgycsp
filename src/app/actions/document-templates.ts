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

export async function getDocumentTemplateByType(type: string, workspaceId: string | null = null) {
  try {
    return await db.documentTemplate.findFirst({
      where: { type, workspaceId, isActive: true },
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch template by type:", error);
    return null;
  }
}

export async function checkActiveTemplateExists(type: string, workspaceId: string | null = null) {
  try {
    const existing = await db.documentTemplate.findFirst({
      where: { type, workspaceId, isActive: true },
      select: { id: true, name: true }
    });
    return { exists: !!existing, name: existing?.name };
  } catch (error) {
    return { exists: false };
  }
}

export async function toggleTemplateStatus(id: string, isActive: boolean, type: string, workspaceId: string | null = null) {
  try {
    if (isActive) {
      // Deactivate all others of this type
      await db.documentTemplate.updateMany({
        where: { type, workspaceId, id: { not: id } },
        data: { isActive: false }
      });
    }
    await db.documentTemplate.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/super-admin/documents");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  isActive?: boolean;
  workspaceId?: string | null;
}) {
  try {
    const { id, isActive = true, ...payload } = data;
    
    if (isActive) {
      // Deactivate others
      await db.documentTemplate.updateMany({
        where: { type: payload.type, workspaceId: payload.workspaceId || null, ...(id ? { id: { not: id } } : {}) },
        data: { isActive: false }
      });
    }
    
    if (id) {
      await db.documentTemplate.update({
        where: { id },
        data: { ...payload, isActive }
      });
      revalidatePath("/super-admin/documents");
      return { success: true, id };
    } else {
      const newTemplate = await db.documentTemplate.create({
        data: { ...payload, isActive }
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
