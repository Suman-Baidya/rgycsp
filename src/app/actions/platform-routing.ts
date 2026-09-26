"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createLog } from "./logs";

import { 
  type PlatformRoutingConfig, 
  type PlatformRoutingMode, 
  DEFAULT_ROUTING_CONFIG 
} from "@/lib/routing-config";
import { isDeveloperEmail } from "@/lib/developer";

/**
 * Fetch global platform routing configuration from SiteSettings.
 */
export async function getPlatformRoutingConfig(): Promise<PlatformRoutingConfig> {
  try {
    const settings = await db.siteSettings.findFirst({
      where: { workspaceId: null },
      select: { routingConfig: true }
    });

    if (settings?.routingConfig && typeof settings.routingConfig === 'object') {
      const parsed = settings.routingConfig as any;
      return {
        routingMode: parsed.routingMode || DEFAULT_ROUTING_CONFIG.routingMode,
        enableSubdomains: parsed.enableSubdomains ?? (parsed.routingMode !== "SUBDIRECTORY"),
        enableSubdirectories: parsed.enableSubdirectories ?? true,
        autoRedirectSubdomain: parsed.autoRedirectSubdomain ?? true,
        defaultUrlMode: parsed.defaultUrlMode || (parsed.routingMode === "SUBDOMAIN" ? "SUBDOMAIN" : "SUBDIRECTORY"),
        enablePwa: parsed.enablePwa ?? false,
        enablePwaInstallPrompt: parsed.enablePwaInstallPrompt ?? false,
        maintenanceMode: parsed.maintenanceMode ?? false,
        maintenanceMessage: parsed.maintenanceMessage || DEFAULT_ROUTING_CONFIG.maintenanceMessage,
        enableVerboseLogging: parsed.enableVerboseLogging ?? false,
        updatedAt: parsed.updatedAt,
        updatedBy: parsed.updatedBy,
      };
    }
  } catch (error) {
    console.error("Failed to fetch platform routing config:", error);
  }

  // Fallback to environment variable or safe default
  const envMode = process.env.NEXT_PUBLIC_DEFAULT_ROUTING_MODE?.toUpperCase();
  if (envMode === "SUBDOMAIN" || envMode === "BOTH" || envMode === "SUBDIRECTORY") {
    return {
      ...DEFAULT_ROUTING_CONFIG,
      routingMode: envMode as PlatformRoutingMode,
      enableSubdomains: envMode !== "SUBDIRECTORY",
      defaultUrlMode: envMode === "SUBDOMAIN" ? "SUBDOMAIN" : "SUBDIRECTORY"
    };
  }

  return DEFAULT_ROUTING_CONFIG;
}

/**
 * Update global platform routing configuration.
 * Strictly restricted to verified Developer admin only.
 */
export async function updatePlatformRoutingConfig(config: PlatformRoutingConfig) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const isDev = Boolean(
      isDeveloperEmail(session.user.email) ||
      (session.user as any)?.isDeveloper
    );

    if (!isDev) {
      return { 
        success: false, 
        error: "Access Denied: Only verified Developer Administrators can modify platform routing architecture." 
      };
    }

    // Find global site settings
    let siteSettings = await db.siteSettings.findFirst({
      where: { workspaceId: null },
      select: { id: true }
    });

    const payload: PlatformRoutingConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: "System Core",
    };

    if (siteSettings) {
      await db.siteSettings.update({
        where: { id: siteSettings.id },
        data: {
          routingConfig: payload as any,
        }
      });
    } else {
      await db.siteSettings.create({
        data: {
          workspaceId: null,
          routingConfig: payload as any,
        }
      });
    }

    // Set cookie for instant Edge / Proxy / Client synchronization without DB latency
    const cookieStore = await cookies();
    cookieStore.set("platform_routing_mode", config.routingMode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    cookieStore.set("platform_routing_subdomain", config.enableSubdomains ? "1" : "0", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    // Write audit log
    await createLog(
      "INFO",
      "ROUTING_ENGINE",
      `Platform routing configuration updated: Mode=${config.routingMode}, Subdomains=${config.enableSubdomains ? 'Enabled' : 'Disabled'}, Subdirectories=${config.enableSubdirectories ? 'Enabled' : 'Disabled'}`,
      "SYSTEM_CORE"
    );

    // Revalidate caches
    (revalidateTag as any)("site-settings");
    revalidatePath("/super-admin/logs");
    revalidatePath("/super-admin/franchises");
    revalidatePath("/workspaces");

    return { success: true, config: payload };
  } catch (error: any) {
    console.error("Failed to update platform routing config:", error);
    return { success: false, error: error.message || "Failed to update configuration" };
  }
}
