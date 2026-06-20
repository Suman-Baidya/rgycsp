import { headers } from "next/headers";
import { getTenantLink, getRoutingConfig } from "./routing";

/**
 * Detects the current pathname and host from headers.
 */
export async function getServerRoutingContext() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || "/";
  const host = headersList.get('host') || "";
  return { pathname, host };
}

/**
 * Generates a tenant-aware link in a Server Component context.
 */
export async function getServerTenantLink(path: string, tenant: string): Promise<string> {
  const { pathname, host } = await getServerRoutingContext();
  // Pass host to getTenantLink implicitly via getRoutingConfig inside it
  // But wait, getTenantLink in routing.ts uses window.location.host.
  // We need to ensure it uses the server host if window is undefined.
  
  // Actually, let's just call getTenantLink and it will use getRoutingConfig.
  // We need to make sure getRoutingConfig inside getTenantLink can see the host.
  // Currently getTenantLink does: typeof window !== 'undefined' ? window.location.host : undefined
  
  // So we should probably export a version that takes config or just pass the parameters.
  return getTenantLink(path, tenant, pathname, host); 
}

/**
 * Checks if the current request is in Subdirectory Mode.
 */
export async function isSubdirectoryMode(): Promise<boolean> {
  const { pathname, host } = await getServerRoutingContext();
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
