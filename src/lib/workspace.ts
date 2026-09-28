import { db } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getWorkspaceByTenant = (tenant: string) => {
  if (!tenant) return Promise.resolve(null);
  const normalized = tenant.toLowerCase().trim();
  return unstable_cache(
    async () => {
      return await db.workspace.findFirst({
        where: {
          OR: [
            { subdomain: normalized },
            { centerCode: { equals: normalized, mode: 'insensitive' } },
            { id: tenant }
          ]
        },
        include: {
          siteSettings: true,
          admissionConfig: true,
        },
      });
    },
    [`workspace-tenant-${normalized}`],
    {
      tags: [`workspace-${normalized}`, "workspaces"],
      revalidate: 1800, // Cache for 30 minutes in memory
    }
  )();
};
