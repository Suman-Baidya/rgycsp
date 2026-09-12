import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ABCD Edu Hub | RGYCSP Platform",
    short_name: "ABCD Edu Hub",
    description: "Next-generation institutional education, student learning portal, and multi-tenant franchise LMS platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#0284c7",
    orientation: "portrait-primary",
    icons: [
      {
        src: "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
