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
      // Also update RGB version for Tailwind opacity if needed
      const hex = primaryColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      root.style.setProperty("--primary-rgb", `${r}, ${g}, ${b}`);
    }
    
    if (accentColor && accentColor.startsWith("#")) {
      root.style.setProperty("--accent", accentColor);
      root.style.setProperty("--accent-foreground", getContrastColor(accentColor));
    }

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

  // Inject a style block to force apply the font to Tailwind classes
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        ${fontFamily ? `--font-sans: "${fontFamily}", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;` : ''}
      }
      .font-sans {
        font-family: var(--font-sans) !important;
      }
      body {
        font-family: var(--font-sans) !important;
      }
    `}} />
  );
}
