import type { MetadataRoute } from "next";
import { getCachedGlobalSettings } from "@/lib/settings";
import { DEFAULT_ROUTING_CONFIG } from "@/lib/routing-config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const globalSettings = await getCachedGlobalSettings();
  const routingConfig = (globalSettings?.routingConfig as any) || DEFAULT_ROUTING_CONFIG;

  // If PWA is disabled by Developer, return un-installable manifest
  if (!routingConfig.enablePwa) {
    return {
      name: "",
      short_name: "",
      start_url: "/",
      display: "browser",
      icons: [],
    };
  }

  const siteName = globalSettings?.siteName || "ABCD Edu Hub";
  const desc = globalSettings?.brandDescription || "Next-generation institutional education, student learning portal, and multi-tenant franchise LMS platform.";
  const iconUrl = globalSettings?.faviconUrl || globalSettings?.logoUrl || "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp";

  return {
    name: siteName,
    short_name: siteName.slice(0, 16),
    description: desc,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: globalSettings?.primaryColor || "#0284c7",
    orientation: "portrait-primary",
    icons: [
      {
        src: iconUrl,
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: iconUrl,
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
