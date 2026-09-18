"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function importWorkspacesCSV(rows: any[]) {
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Batch pre-fetch existing subdomains and users to eliminate N+1 queries
  const incomingSubdomains = rows.map(r => r.subdomain?.trim().toLowerCase()).filter(Boolean);
  const incomingEmails = rows.map(r => r.ownerEmail?.trim().toLowerCase()).filter(Boolean);

  const [existingWorkspaces, existingUsers] = await Promise.all([
    db.workspace.findMany({
      where: { subdomain: { in: incomingSubdomains } },
      select: { subdomain: true },
    }),
    db.user.findMany({
      where: { email: { in: incomingEmails } },
    }),
  ]);

  const existingSubdomainsSet = new Set(existingWorkspaces.map(w => w.subdomain.toLowerCase()));
  const existingUsersMap = new Map(existingUsers.filter(u => u.email).map(u => [u.email!.toLowerCase(), u]));

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
        whatsapp,
        contactEmail,
        address,
        state,
        district,
        pinCode,
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

      const normalizedSubdomain = subdomain.trim().toLowerCase();

      // Check if subdomain exists in memory
      if (existingSubdomainsSet.has(normalizedSubdomain)) {
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

      // Check if user exists in memory, or create user
      let user = existingUsersMap.get(ownerEmail.trim().toLowerCase());

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
          subdomain: subdomain.toLowerCase(),
          isActive: true,
          centerCode: codeToUse,
          state: state || null,
          district: district || null,
          pinCode: pinCode || null,
          siteSettings: {
            create: {
              siteName: name,
              contactEmail: contactEmail || ownerEmail,
              contactPhone: contactPhone || null,
              whatsapp: whatsapp || null,
              address: address || null,
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
