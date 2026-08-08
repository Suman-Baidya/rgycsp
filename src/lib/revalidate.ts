import { revalidatePath } from "next/cache";
import { db } from "./prisma";

/**
 * Revalidates cache for a specific workspace dynamically to prevent global cache stampedes.
 * Next.js `revalidatePath('/app/[tenant]/...')` flushes ALL tenants. This helper 
 * resolves the specific tenant subdomain and only flushes that tenant's cache.
 * 
 * @param workspaceId The ID of the workspace
 * @param relativePath The relative path to revalidate (e.g. '/admin/students', or '/' for root layout)
 * @param type Optional type 'page' | 'layout'
 */
export async function revalidateWorkspacePath(workspaceId: string | null | undefined, relativePath: string, type?: 'page' | 'layout') {
  if (!workspaceId) {
    // If it's a global action (super admin), flush the global cache
    if (type) {
      revalidatePath(relativePath, type);
    } else {
      revalidatePath(relativePath);
    }
    return;
  }

  try {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { subdomain: true }
    });

    if (workspace && workspace.subdomain) {
      const fullPath = `/app/${workspace.subdomain}${relativePath === '/' ? '' : relativePath}`;
      if (type) {
        revalidatePath(fullPath, type);
      } else {
        revalidatePath(fullPath);
      }
    } else {
      // Fallback if workspace not found
      if (type) {
        revalidatePath(`/app/[tenant]${relativePath === '/' ? '' : relativePath}`, type);
      } else {
        revalidatePath(`/app/[tenant]${relativePath === '/' ? '' : relativePath}`);
      }
    }
  } catch (error) {
    console.error("Failed to revalidate workspace path:", error);
  }
}
