import { db } from "@/lib/prisma";

export async function getWorkspaceByTenant(tenant: string) {
  return await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: {
      siteSettings: true,
      admissionConfig: true
    }
  });
}
