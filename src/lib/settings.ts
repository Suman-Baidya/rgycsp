import { db } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Cache the global settings query to avoid hitting Neon DB on every request for dynamic pages
export const getCachedGlobalSettings = unstable_cache(
  async (includeSections = false) => {
    return await db.siteSettings.findFirst({
      where: { workspaceId: null },
      include: includeSections ? { sections: { orderBy: { order: "asc" } } } : undefined,
    });
  },
  ["global-site-settings"],
  {
    tags: ["site-settings"], // This tag can be revalidated when settings are updated
    revalidate: 3600, // Revalidate every hour just in case
  }
);
