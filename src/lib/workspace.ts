import { db } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getWorkspaceByTenant = (tenant: string) => {
  const normalized = tenant?.toLowerCase();
  return unstable_cache(
    async () => {
      return await db.workspace.findUnique({
        where: { subdomain: normalized },
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
