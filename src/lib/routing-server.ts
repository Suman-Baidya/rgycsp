import { headers } from "next/headers";
import { getTenantLink, getRoutingConfig } from "./routing";

/**
 * Detects the current pathname and host from headers.
 */
export async function getServerRoutingContext() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || "/";
  const rawHost = headersList.get('x-forwarded-host') || headersList.get('host') || "";
  const host = rawHost.split(',')[0].trim();
  const routingMode = headersList.get('x-routing-mode') || "";
  return { pathname, host, routingMode };
}

/**
 * Generates a tenant-aware link in a Server Component context.
 */
export async function getServerTenantLink(path: string, tenant: string): Promise<string> {
  const { pathname, host, routingMode } = await getServerRoutingContext();
  const forcedMode = routingMode === "SUBDIRECTORY" ? "subdirectory" : undefined;
  return getTenantLink(path, tenant, pathname, host, forcedMode); 
}

/**
 * Checks if the current request is in Subdirectory Mode.
 */
export async function isSubdirectoryMode(): Promise<boolean> {
  const { pathname, host, routingMode } = await getServerRoutingContext();
  if (routingMode === "SUBDIRECTORY") return true;
  const config = getRoutingConfig(pathname, host);
  return config.mode === "subdirectory";
}

/**
 * Gets the workspace base prefix for the current server request.
 */
export async function getServerWorkspaceBase(tenant: string): Promise<string> {
  const { pathname, host } = await getServerRoutingContext();
  const { workspaceBase } = getRoutingConfig(pathname, host, tenant);
  return workspaceBase;
}
