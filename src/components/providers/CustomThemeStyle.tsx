"use client";

import { useEffect } from "react";

function getContrastColor(hex: string) {
  if (!hex || !hex.startsWith("#")) return "#ffffff";
  
  // Remove # if present
  const color = hex.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calculate YIQ contrast
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Return Zinc 950 for light backgrounds, Zinc 50 for dark
  return (yiq >= 128) ? "#09090b" : "#fafafa";
}

export function CustomThemeStyle({ primaryColor, accentColor, fontFamily }: { primaryColor?: string, accentColor?: string, fontFamily?: string }) {
  useEffect(() => {
    const root = document.documentElement;

    // --- Dynamic Color Theming ---
    if (primaryColor && primaryColor.startsWith("#")) {
      root.style.setProperty("--primary", primaryColor);
      root.style.setProperty("--primary-foreground", getContrastColor(primaryColor));
      root.style.setProperty("--ring", primaryColor);
    }
    
    if (accentColor && accentColor.startsWith("#")) {
      root.style.setProperty("--accent", accentColor);
      root.style.setProperty("--accent-foreground", getContrastColor(accentColor));
    }

    // --- Dynamic Typography ---
    if (fontFamily) {
      // 1. Set the CSS variable
      root.style.setProperty("--font-sans", `${fontFamily}, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`);

      // 2. Load the font from Google Fonts if it's not a system font
      const systemFonts = ["ui-sans-serif", "system-ui", "sans-serif", "serif"];
      if (!systemFonts.includes(fontFamily.toLowerCase())) {
        const fontId = "dynamic-google-font";
        let link = document.getElementById(fontId) as HTMLLinkElement;
        
        if (!link) {
          link = document.createElement("link");
          link.id = fontId;
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }
        
        // Encode font name for Google Fonts URL
        const encodedFont = fontFamily.replace(/\s+/g, "+");
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;300;400;500;700;900&display=swap`;
      }
    }

  }, [primaryColor, accentColor, fontFamily]);

  return null;
}
