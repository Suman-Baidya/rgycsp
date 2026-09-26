export type PlatformRoutingMode = "SUBDIRECTORY" | "SUBDOMAIN" | "BOTH";

export interface PlatformRoutingConfig {
  // Routing & Architecture
  routingMode: PlatformRoutingMode;
  enableSubdomains: boolean;
  enableSubdirectories: boolean;
  autoRedirectSubdomain: boolean;
  defaultUrlMode: "SUBDIRECTORY" | "SUBDOMAIN";

  // Progressive Web App (PWA) Settings
  enablePwa: boolean;
  enablePwaInstallPrompt: boolean;

  // System & Maintenance Controls
  maintenanceMode: boolean;
  maintenanceMessage: string;
  enableVerboseLogging: boolean;

  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_ROUTING_CONFIG: PlatformRoutingConfig = {
  routingMode: "SUBDIRECTORY",
  enableSubdomains: false,
  enableSubdirectories: true,
  autoRedirectSubdomain: true,
  defaultUrlMode: "SUBDIRECTORY",

  enablePwa: false,
  enablePwaInstallPrompt: false,

  maintenanceMode: false,
  maintenanceMessage: "The platform is currently undergoing scheduled maintenance. Please check back shortly.",
  enableVerboseLogging: false,
};
