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

  // User Guide & Knowledge Base Controls
  enableUserGuides: boolean; // Master toggle controlled by Developer (default: false)
  enableSuperAdminGuides: boolean; // Developer control for Super Admin (default: false)
  enableFranchiseGuides: boolean; // Developer master permission for Franchise Admin (default: false)
  franchiseGuidesEnabled: boolean; // Super Admin toggle for Franchise Admin visibility (default: false)

  // Granular Content Controls (Developer Master Switches)
  enableGuideVideos: boolean; // Allow YouTube video walkthroughs & player
  enableGuidePdfs: boolean; // Allow PDF manuals & SOP document downloads
  enableGuideArticles: boolean; // Allow step-by-step written articles
  enableGuideExternalLinks: boolean; // Allow external reference links

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

  enableUserGuides: false,
  enableSuperAdminGuides: false,
  enableFranchiseGuides: false,
  franchiseGuidesEnabled: false,

  enableGuideVideos: false,
  enableGuidePdfs: false,
  enableGuideArticles: false,
  enableGuideExternalLinks: false,
};
