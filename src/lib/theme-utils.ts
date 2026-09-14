/**
 * Theme and Color Utilities for ABCD Edu Hub
 * Provides smart contrast calculations and adaptive dark-mode transformations.
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export function parseHex(hex: string): RgbColor | null {
  if (!hex || typeof hex !== "string") return null;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return null;

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Calculates perceived brightness / luminance via YIQ (0 = pitch black, 255 = pure white)
 */
export function getYiqLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 128;
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/**
 * Returns readable foreground text color (#09090b or #fafafa) based on background contrast
 */
export function getContrastColor(hex: string): string {
  const yiq = getYiqLuminance(hex);
  return yiq >= 128 ? "#09090b" : "#fafafa";
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HslColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL back to 6-char HEX string with leading #
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Determines whether a color is considered "dark" or "black" that would blend into dark mode backgrounds.
 */
export function isDarkThemeColor(hex?: string | null): boolean {
  if (!hex) return false;
  const rgb = parseHex(hex);
  if (!rgb) return false;

  const yiq = getYiqLuminance(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Near black, dark charcoal, or low brightness
  return yiq < 65 || (hsl.l < 30 && hsl.s < 30);
}

export interface ThemeColorVariant {
  primary: string;
  primaryForeground: string;
  primaryRgb: string;
  ring: string;
  accent: string;
  accentForeground: string;
  accentRgb: string;
}

export interface AdaptiveThemeConfig {
  isDarkChoice: boolean;
  light: ThemeColorVariant;
  dark: ThemeColorVariant;
}

/**
 * Generates paired Light-Mode and Dark-Mode safe tokens from user-chosen primary and accent colors.
 */
export function getAdaptiveThemeColors(
  primaryHex?: string | null,
  accentHex?: string | null
): AdaptiveThemeConfig {
  const p = primaryHex && primaryHex.startsWith("#") ? primaryHex : "#09090b";
  const a = accentHex && accentHex.startsWith("#") ? accentHex : p;

  const pRgb = parseHex(p) || { r: 9, g: 9, b: 11 };
  const aRgb = parseHex(a) || { r: 9, g: 9, b: 11 };

  const pYiq = getYiqLuminance(p);
  const aYiq = getYiqLuminance(a);

  const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);
  const aHsl = rgbToHsl(aRgb.r, aRgb.g, aRgb.b);

  const isDarkChoice = isDarkThemeColor(p);

  // --- Dark Mode Adaptation ---
  let darkPrimary = p;
  let darkPrimaryFg = getContrastColor(p);

  if (isDarkChoice) {
    // If user selected black / dark charcoal:
    // In dark mode, invert primary to crisp high-contrast white / zinc-50 (standard Shadcn dark mode pattern)
    darkPrimary = "#fafafa";
    darkPrimaryFg = "#09090b";
  } else if (pHsl.l < 45) {
    // If user selected a dark saturated color (e.g. dark navy, deep emerald, dark maroon)
    // Elevate lightness to 62% so it pops vividly against dark slate/zinc backgrounds
    darkPrimary = hslToHex(pHsl.h, Math.min(pHsl.s + 5, 95), 62);
    darkPrimaryFg = getContrastColor(darkPrimary);
  }

  let darkAccent = a;
  let darkAccentFg = getContrastColor(a);

  if (isDarkThemeColor(a)) {
    darkAccent = "#27272a"; // Elevated zinc-800 for dark mode secondary/accent
    darkAccentFg = "#fafafa";
  } else if (aHsl.l < 45) {
    darkAccent = hslToHex(aHsl.h, Math.min(aHsl.s + 5, 95), 58);
    darkAccentFg = getContrastColor(darkAccent);
  }

  const darkPRgb = parseHex(darkPrimary) || { r: 250, g: 250, b: 250 };
  const darkARgb = parseHex(darkAccent) || { r: 39, g: 39, b: 42 };

  return {
    isDarkChoice,
    light: {
      primary: p,
      primaryForeground: getContrastColor(p),
      primaryRgb: `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`,
      ring: p,
      accent: a,
      accentForeground: getContrastColor(a),
      accentRgb: `${aRgb.r}, ${aRgb.g}, ${aRgb.b}`,
    },
    dark: {
      primary: darkPrimary,
      primaryForeground: darkPrimaryFg,
      primaryRgb: `${darkPRgb.r}, ${darkPRgb.g}, ${darkPRgb.b}`,
      ring: isDarkChoice ? "#3f3f46" : darkPrimary,
      accent: darkAccent,
      accentForeground: darkAccentFg,
      accentRgb: `${darkARgb.r}, ${darkARgb.g}, ${darkARgb.b}`,
    },
  };
}
