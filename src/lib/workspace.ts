/**
 * @file src/lib/workspace.ts
 *
 * SINGLE SOURCE OF TRUTH for looking up a workspace by tenant slug.
 *
 * WHY THIS EXISTS:
 * The `[tenant]` URL segment can be any of three things:
 *   1. The workspace `subdomain`  (e.g. "chandpara")
 *   2. The workspace `centerCode` (e.g. "CHAN01" or "chandpara")
 *   3. The workspace `id`         (UUID - used internally)
 *
 * Using findUnique({ where: { subdomain: slug } }) ONLY matches case 1.
 * If the slug matches a centerCode but not a subdomain, the query returns
 * null -> notFound() -> 404.  This was the root cause of the recurring
 * "franchise sidebar links show 404" bug.
 *
 * ALWAYS use the helpers below instead of raw Prisma calls.
 */

import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Resolves the correct `where` clause for a workspace lookup
 * from any tenant URL slug (subdomain / centerCode / id).
 */
export function tenantWhereClause(slug: string) {
  const normalized = slug?.toLowerCase()?.trim();
  return {
    OR: [
      { subdomain: normalized },
      { centerCode: { equals: normalized, mode: "insensitive" as const } },
      { id: slug },
    ],
  };
}

/**
 * Finds a workspace by tenant slug (subdomain OR centerCode OR id).
 *
 * Use this in EVERY admin/student page instead of:
 *   db.workspace.findUnique({ where: { subdomain: tenant } })
 *
 * @param slug    - The [tenant] URL param value
 * @param options - Optional Prisma select or include object
 *
 * @example
 * const workspace = await findWorkspaceByTenant(tenant, {
 *   select: { id: true, name: true, subdomain: true }
 * });
 * if (!workspace) notFound();
 */
export async function findWorkspaceByTenant<T extends Prisma.WorkspaceFindFirstArgs = {}>(
  slug: string,
  options?: Prisma.SelectSubset<T, Prisma.WorkspaceFindFirstArgs>
): Promise<Prisma.WorkspaceGetPayload<T> | null> {
  const executeQuery = () => db.workspace.findFirst({
    where: tenantWhereClause(slug),
    ...(options as any),
  }) as Promise<Prisma.WorkspaceGetPayload<T> | null>;

  try {
    return await executeQuery();
  } catch (err: any) {
    const isTransient =
      err?.message?.includes("Connection terminated") ||
      err?.message?.includes("connection timeout") ||
      err?.message?.includes("Can't reach database server") ||
      err?.code === "P1001";

    if (isTransient) {
      console.warn("PRISMA: Transient database error in findWorkspaceByTenant, retrying query...", err.message);
      await new Promise((res) => setTimeout(res, 500));
      return await executeQuery();
    }
    throw err;
  }
}

/**
 * Alias for findWorkspaceByTenant that includes siteSettings by default.
 * Used by [tenant]/layout.tsx and other places needing siteSettings.
 *
 * NEVER replace this with:
 *   db.workspace.findUnique({ where: { subdomain: tenant } })
 */
export async function getWorkspaceByTenant(slug: string) {
  const executeQuery = () => db.workspace.findFirst({
    where: tenantWhereClause(slug),
    include: { siteSettings: true },
  });

  try {
    return await executeQuery();
  } catch (err: any) {
    const isTransient =
      err?.message?.includes("Connection terminated") ||
      err?.message?.includes("connection timeout") ||
      err?.message?.includes("Can't reach database server") ||
      err?.code === "P1001";

    if (isTransient) {
      console.warn("PRISMA: Transient database error in getWorkspaceByTenant, retrying query...", err.message);
      await new Promise((res) => setTimeout(res, 500));
      return await executeQuery();
    }
    throw err;
  }
}
