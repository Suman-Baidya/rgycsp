"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(data: any) {
  try {
    const settings = await db.siteSettings.findFirst({
      where: { workspaceId: null },
    });

    if (settings) {
      await db.siteSettings.update({
        where: { id: settings.id },
        data: {
          siteName: data.siteName,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          whatsapp: data.whatsapp,
          address: data.address,
          brandDescription: data.brandDescription,
          socialLinks: data.socialLinks,
          navigation: data.navigation,
          navbarConfig: data.navbarConfig,
        },
      });
    } else {
      await db.siteSettings.create({
        data: {
          workspaceId: null,
          siteName: data.siteName,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          whatsapp: data.whatsapp,
          address: data.address,
          brandDescription: data.brandDescription,
          socialLinks: data.socialLinks,
          navigation: data.navigation,
          navbarConfig: data.navbarConfig,
        },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/(admin)/super-admin/settings");
    
    return { success: true };
  } catch (error: any) {
    console.error("CRITICAL: Failed to update site settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Database operation failed" 
    };
  }
}

export async function updateLandingSection(sectionId: string, data: any) {
  try {
    await db.landingSection.update({
      where: { id: sectionId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        isActive: data.isActive,
        content: data.content,
        order: data.order,
      },
    });

    revalidatePath("/");
    revalidatePath("/(admin)/super-admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update landing section:", error);
    return { success: false, error: "Failed to update landing section" };
  }
}

export async function syncAllSections(settingsId: string, sectionTypes: string[]) {
  try {
    const existingSections = await db.landingSection.findMany({
      where: { siteSettingsId: settingsId }
    });
    
    const existingTypes = existingSections.map(s => s.type);
    const missingTypes = sectionTypes.filter(t => !existingTypes.includes(t));

    if (missingTypes.length === 0) return { success: true, created: 0 };

    await Promise.all(missingTypes.map((type, index) => {
      return db.landingSection.create({
        data: {
          siteSettingsId: settingsId,
          type,
          title: type.charAt(0).toUpperCase() + type.slice(1),
          isActive: false,
          order: existingSections.length + index,
          content: {}
        }
      });
    }));

    revalidatePath("/");
    revalidatePath("/(admin)/super-admin/settings");
    return { success: true, created: missingTypes.length };
  } catch (error) {
    console.error("Failed to sync sections:", error);
    return { success: false, error: "Sync failed" };
  }
}
