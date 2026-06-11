"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function importWorkspacesCSV(rows: any[]) {
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const [index, row] of rows.entries()) {
    try {
      const { 
        centerCode,
        name, 
        subdomain, 
        ownerName, 
        ownerEmail, 
        ownerPassword,
        contactPhone,
        primaryColor,
        brandDescription
      } = row;

      if (!name || !subdomain || !ownerName || !ownerEmail || !ownerPassword) {
        results.push({ 
          row: index + 1, 
          success: false, 
          error: "Missing required fields (name, subdomain, ownerName, ownerEmail, ownerPassword)." 
        });
        failureCount++;
        continue;
      }

      // Check if subdomain exists
      const existingWorkspace = await db.workspace.findUnique({
        where: { subdomain },
      });

      if (existingWorkspace) {
        results.push({ 
          row: index + 1, 
          success: false, 
          error: `Subdomain '${subdomain}' is already in use.` 
        });
        failureCount++;
        continue;
      }

      // Generate centerCode if not provided
      const codeToUse = centerCode || `WB-${String(Math.floor(100 + Math.random() * 900))}`;

      // Check if user exists, or create user
      let user = await db.user.findUnique({
        where: { email: ownerEmail },
      });

      if (!user) {
        const passwordHash = await bcrypt.hash(ownerPassword, 10);
        user = await db.user.create({
          data: {
            name: ownerName,
            email: ownerEmail,
            username: codeToUse,
            passwordHash,
            role: "USER",
          },
        });
      } else if (!user.username) {
        user = await db.user.update({
          where: { id: user.id },
          data: { username: codeToUse }
        });
      }

      // Create Workspace with associated SiteSettings
      const workspace = await db.workspace.create({
        data: {
          name,
          subdomain,
          isActive: true,
          siteSettings: {
            create: {
              siteName: name,
              contactEmail: ownerEmail,
              contactPhone: contactPhone || null,
              primaryColor: primaryColor || "#3b82f6",
              brandDescription: brandDescription || `Welcome to ${name}`,
            }
          }
        },
      });

      // Create WorkspaceRole
      await db.workspaceRole.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: "ADMIN",
        },
      });

      results.push({ 
        row: index + 1, 
        success: true, 
        workspaceId: workspace.id, 
        name, 
        subdomain 
      });
      successCount++;
    } catch (error: any) {
      console.error(`Failed to import row ${index + 1}:`, error);
      results.push({ 
        row: index + 1, 
        success: false, 
        error: error.message || "Unknown error occurred." 
      });
      failureCount++;
    }
  }

  if (successCount > 0) {
    revalidatePath("/(admin)/super-admin", "page");
    revalidatePath("/(admin)/super-admin/franchises", "page");
  }

  return { 
    success: true, 
    results, 
    summary: { 
      total: rows.length, 
      success: successCount, 
      failure: failureCount 
    } 
  };
}
