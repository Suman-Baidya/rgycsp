"use client";

import { useEffect } from "react";
import { getAdaptiveThemeColors } from "@/lib/theme-utils";

export function CustomThemeStyle({
  primaryColor,
  accentColor,
  fontFamily,
}: {
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}) {
  const adaptive = getAdaptiveThemeColors(primaryColor, accentColor);

  useEffect(() => {
    const root = document.documentElement;

    // Clean up any legacy inline variables so the CSS :root and .dark rules cascade cleanly
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    root.style.removeProperty("--ring");
    root.style.removeProperty("--primary-rgb");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
    root.style.removeProperty("--accent-rgb");

    // --- Dynamic Typography ---
    if (fontFamily) {
      const systemFonts = ["ui-sans-serif", "system-ui", "sans-serif", "serif"];
      const isSystemFont = systemFonts.includes(fontFamily.toLowerCase());

      const fullFontFamily = isSystemFont
        ? fontFamily
        : `"${fontFamily}", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

      root.style.setProperty("--font-sans", fullFontFamily);
      document.body.style.fontFamily = fullFontFamily;

      if (!isSystemFont) {
        const fontId = "dynamic-google-font";
        let link = document.getElementById(fontId) as HTMLLinkElement;

        if (!link) {
          link = document.createElement("link");
          link.id = fontId;
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }

        const encodedFont = fontFamily.replace(/\s+/g, "+");
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
      }
    }
  }, [primaryColor, accentColor, fontFamily]);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      :root {
        --primary: ${adaptive.light.primary};
        --primary-foreground: ${adaptive.light.primaryForeground};
        --ring: ${adaptive.light.ring};
        --primary-rgb: ${adaptive.light.primaryRgb};
        --accent: ${adaptive.light.accent};
        --accent-foreground: ${adaptive.light.accentForeground};
        --accent-rgb: ${adaptive.light.accentRgb};
        ${
          fontFamily
            ? `--font-sans: "${fontFamily}", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;`
            : ""
        }
      }

      .dark, [data-theme="dark"], .dark-context {
        --primary: ${adaptive.dark.primary} !important;
        --primary-foreground: ${adaptive.dark.primaryForeground} !important;
        --ring: ${adaptive.dark.ring} !important;
        --primary-rgb: ${adaptive.dark.primaryRgb} !important;
        --accent: ${adaptive.dark.accent} !important;
        --accent-foreground: ${adaptive.dark.accentForeground} !important;
        --accent-rgb: ${adaptive.dark.accentRgb} !important;
      }

      .font-sans {
        font-family: var(--font-sans) !important;
      }
      body {
        font-family: var(--font-sans) !important;
      }
    `,
      }}
    />
  );
}
export { getContrastColor } from "@/lib/theme-utils";
