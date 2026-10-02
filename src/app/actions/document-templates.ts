"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDocumentTemplates(workspaceId: string | null = null) {
  try {
    return await db.documentTemplate.findMany({
      where: { 
        workspaceId,
        type: { not: "EXAMPLE_DATA" }
      },
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
}

export async function getActiveDocumentTemplates(workspaceId: string | null = null) {
  try {
    return await db.documentTemplate.findMany({
      where: { 
        workspaceId,
        isActive: true,
        type: { not: "EXAMPLE_DATA" }
      },
      select: {
        id: true,
        name: true,
        type: true,
        background: true,
        width: true,
        height: true,
        isActive: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch active templates:", error);
    return [];
  }
}

export async function getDocumentTemplateById(id: string) {
  try {
    return await db.documentTemplate.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error("Failed to fetch template by id:", error);
    return null;
  }
}

export async function getDocumentTemplateByType(type: string, workspaceId: string | null = null, templateId?: string | null) {
  try {
    if (templateId) {
      const specific = await db.documentTemplate.findUnique({
        where: { id: templateId }
      });
      if (specific) return specific;
    }

    let template = await db.documentTemplate.findFirst({
      where: { type, workspaceId, isActive: true },
      orderBy: { updatedAt: "desc" }
    });

    if (!template && workspaceId !== null) {
      template = await db.documentTemplate.findFirst({
        where: { type, workspaceId: null, isActive: true },
        orderBy: { updatedAt: "desc" }
      });
    }

    return template;
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

export async function toggleTemplateStatus(id: string, isActive: boolean, type?: string, workspaceId: string | null = null) {
  try {
    // Allows multiple active templates concurrently without deactivating others
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
    
    // Multiple active designs permitted concurrently (e.g., Old vs New certificate designs)
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

// Example Data Management
export async function getExampleData(workspaceId: string | null = null) {
  try {
    const template = await db.documentTemplate.findFirst({
      where: { type: "EXAMPLE_DATA", workspaceId }
    });
    
    if (template && template.config) {
      return typeof template.config === 'string' ? JSON.parse(template.config) : template.config;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch example data:", error);
    return null;
  }
}

export async function saveExampleData(data: Record<string, string>, workspaceId: string | null = null) {
  try {
    const existing = await db.documentTemplate.findFirst({
      where: { type: "EXAMPLE_DATA", workspaceId }
    });

    if (existing) {
      await db.documentTemplate.update({
        where: { id: existing.id },
        data: { config: data as any }
      });
    } else {
      await db.documentTemplate.create({
        data: {
          name: "Global Example Data",
          type: "EXAMPLE_DATA",
          workspaceId,
          config: data as any,
          isActive: false
        }
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save example data:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllNoticepadTemplates(workspaceId: string | null = null) {
  try {
    let templates = await db.documentTemplate.findMany({
      where: {
        type: "NOTICE_PAD",
        isActive: true,
        OR: [
          { workspaceId: workspaceId },
          { workspaceId: null },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    if (templates.length > 0) return templates;

    // Check if any template exists anywhere in DB
    const anyNoticepad = await db.documentTemplate.findFirst({
      where: { type: "NOTICE_PAD" },
      orderBy: { updatedAt: "desc" },
    });
    if (anyNoticepad) return [anyNoticepad];

    // Seed default professional A4 Notice Pad template
    const defaultTemplate = await createDefaultNoticepadTemplate();
    return defaultTemplate ? [defaultTemplate] : [];
  } catch (error) {
    console.error("Failed to fetch noticepad templates:", error);
    return [];
  }
}

export async function createDefaultNoticepadTemplate() {
  try {
    const config = [
      {
        id: "ntc-seal-logo",
        name: "officialSeal",
        type: "image",
        x: 45,
        y: 40,
        width: 70,
        height: 70,
      },
      {
        id: "ntc-org-title",
        name: "custom_header",
        type: "text",
        x: 130,
        y: 40,
        width: 615,
        height: 28,
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#1e3a8a",
        textContent: "RASHTRIYA GRAMIN YUVA COMPUTER SAKSHARTA PROGRAM",
      },
      {
        id: "ntc-org-sub",
        name: "custom_subtitle",
        type: "text",
        x: 130,
        y: 70,
        width: 615,
        height: 18,
        fontSize: 10,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#475569",
        textContent: "CENTRAL HEAD OFFICE & EXAMINATION BOARD • GOVT. RECOGNIZED NATIONWIDE",
      },
      {
        id: "ntc-org-affil",
        name: "custom_affil",
        type: "text",
        x: 130,
        y: 90,
        width: 615,
        height: 16,
        fontSize: 9,
        fontWeight: "normal",
        fontFamily: "Inter",
        color: "#64748b",
        textContent: "Autonomous Institution Registered under NITI Aayog & MCA • ISO 9001:2015 Certified",
      },
      {
        id: "ntc-ref-no",
        name: "noticeRefNo",
        type: "text",
        x: 45,
        y: 130,
        width: 380,
        height: 20,
        fontSize: 11,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#0f172a",
        textContent: "Ref: {noticeRefNo}",
      },
      {
        id: "ntc-date",
        name: "noticeDate",
        type: "text",
        x: 560,
        y: 130,
        width: 190,
        height: 20,
        fontSize: 11,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#0f172a",
        textContent: "Date: {noticeDate}",
      },
      {
        id: "ntc-recipient",
        name: "noticeRecipient",
        type: "text",
        x: 45,
        y: 165,
        width: 705,
        height: 22,
        fontSize: 12,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#334155",
        textContent: "To: {noticeRecipient}",
      },
      {
        id: "ntc-title",
        name: "noticeTitle",
        type: "text",
        x: 45,
        y: 205,
        width: 705,
        height: 35,
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#0f172a",
        textContent: "{noticeTitle}",
      },
      {
        id: "ntc-body",
        name: "noticeBody",
        type: "text",
        x: 45,
        y: 255,
        width: 705,
        height: 480,
        fontSize: 13,
        fontWeight: "normal",
        fontFamily: "Inter",
        color: "#1e293b",
        lineHeight: 1.6,
        textContent: "{noticeBody}",
      },
      {
        id: "ntc-official-seal",
        name: "officialSeal",
        type: "image",
        x: 70,
        y: 770,
        width: 85,
        height: 85,
      },
      {
        id: "ntc-qr",
        name: "qrCode",
        type: "qrcode",
        x: 350,
        y: 770,
        width: 85,
        height: 85,
        qrContentTemplate: "{noticeRefNo} - {noticeTitle}",
      },
      {
        id: "ntc-sign",
        name: "issuerSign",
        type: "signature",
        x: 560,
        y: 755,
        width: 140,
        height: 50,
      },
      {
        id: "ntc-sign-name",
        name: "issuerName",
        type: "text",
        x: 520,
        y: 815,
        width: 230,
        height: 20,
        fontSize: 11,
        fontWeight: "bold",
        fontFamily: "Inter",
        color: "#0f172a",
        textContent: "{issuerName}",
      },
      {
        id: "ntc-sign-role",
        name: "issuerRole",
        type: "text",
        x: 520,
        y: 835,
        width: 230,
        height: 18,
        fontSize: 10,
        fontWeight: "normal",
        fontFamily: "Inter",
        color: "#475569",
        textContent: "{issuerRole}",
      },
      {
        id: "ntc-footer-note",
        name: "custom_footer",
        type: "text",
        x: 45,
        y: 930,
        width: 705,
        height: 20,
        fontSize: 9,
        fontWeight: "normal",
        fontFamily: "Inter",
        color: "#94a3b8",
        textContent: "Official Institutional Notification • Digitally verified and archived on central academic portal.",
      },
    ];

    return await db.documentTemplate.create({
      data: {
        name: "Official A4 Institutional Noticepad",
        type: "NOTICE_PAD",
        width: 794,
        height: 1123,
        config,
        isActive: true,
        workspaceId: null,
      },
    });
  } catch (err) {
    console.error("Failed to create default noticepad template:", err);
    return null;
  }
}
