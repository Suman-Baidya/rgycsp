/**
 * Utility functions for branding and short name generation
 */

/**
 * Returns a clean, concise short brand name.
 * If brand name is too big (> maxCharLength or multiple words exceeding limit),
 * it generates a short name using the first letter of each word (e.g. "Rajeev Gandhi Youth Computer Shiksha Parishad" -> "RGYCSP", "All Bengal Computer Department" -> "ABCD").
 * Defaults to "ABCD" if missing or empty.
 */
export function getBrandShortName(
  brandName?: string | null,
  explicitShortName?: string | null,
  maxCharLength: number = 10
): string {
  // 1. If explicit short name is provided and valid, use it
  if (explicitShortName && explicitShortName.trim().length > 0) {
    return explicitShortName.trim();
  }

  const raw = (brandName || "").trim();
  if (!raw) return "ABCD";

  // 2. If already short enough (<= maxCharLength), use it as is
  if (raw.length <= maxCharLength) {
    return raw;
  }

  // 3. Brand name is too big: generate short name using first letter of each word
  const words = raw
    .replace(/[_\-/\\|]+/g, " ")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length > 1) {
    // If the first word is already an acronym (all caps 2-5 chars, e.g. "ABCD Educational Hub")
    if (
      words[0].length >= 2 &&
      words[0].length <= 5 &&
      words[0] === words[0].toUpperCase() &&
      !/\d/.test(words[0])
    ) {
      return words[0];
    }

    // Filter minor connector words if we still have at least 2 words
    const stopWords = new Set(["of", "and", "the", "in", "on", "at", "to", "for", "a", "an"]);
    const meaningfulWords = words.filter((w) => !stopWords.has(w.toLowerCase()));
    const targetWords = meaningfulWords.length >= 2 ? meaningfulWords : words;

    const acronym = targetWords
      .map((w) => w.charAt(0).toUpperCase())
      .join("");

    if (acronym.length >= 2 && acronym.length <= 8) {
      return acronym;
    }
  }

  // 4. Fallback for single oversized word or unusual string
  if (words.length === 1 && words[0].length > maxCharLength) {
    return words[0].slice(0, 6).toUpperCase();
  }

  return raw.slice(0, maxCharLength) || "ABCD";
}

/**
 * Returns formatted brand display name.
 * If raw name is excessively long for tight headers/bars, returns the short acronym.
 */
export function getDisplayBrandName(
  brandName?: string | null,
  shortName?: string | null,
  maxDisplayLength: number = 25
): { fullName: string; shortName: string; displayName: string } {
  const full = (brandName || "").trim() || "ABCD";
  const short = getBrandShortName(brandName, shortName);
  const displayName = full.length > maxDisplayLength ? short : full;

  return {
    fullName: full,
    shortName: short,
    displayName,
  };
}
