/**
 * @file src/lib/notice-utils.ts
 * Notice slug generation, parsing, and normalization helpers for workspace notice boards.
 */

export interface WorkspaceNotice {
  id?: string;
  title: string;
  date: string;
  category?: string;
  description?: string;
  link?: string;
}

/**
 * Creates a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Generates a stable, reproducible slug/identifier for a notice.
 */
export function getNoticeSlug(notice: { id?: string; title?: string }, index?: number): string {
  if (notice.id && notice.id.trim()) {
    return notice.id.trim();
  }
  if (notice.title && notice.title.trim()) {
    const slug = slugify(notice.title);
    if (slug) return index !== undefined ? `${slug}-${index + 1}` : slug;
  }
  return index !== undefined ? `notice-${index + 1}` : "notice";
}

/**
 * Normalizes an array of raw notices to guarantee unique IDs and consistent fields.
 */
export function normalizeNotices(rawNotices?: any[]): WorkspaceNotice[] {
  if (!Array.isArray(rawNotices) || rawNotices.length === 0) {
    return [];
  }
  const seenIds = new Set<string>();
  return rawNotices.map((n: any, idx: number) => {
    let id = n.id ? String(n.id).trim() : "";
    if (!id) {
      const baseSlug = n.title ? slugify(n.title) : "notice";
      id = `${baseSlug || "notice"}-${idx + 1}`;
    }
    // Prevent duplicate keys
    let uniqueId = id;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);

    return {
      id: uniqueId,
      title: n.title || "",
      date: n.date || "",
      category: n.category || "General",
      description: n.description || "",
      link: n.link || ""
    };
  });
}


/**
 * Finds a notice from an array by slug or identifier.
 */
export function findNoticeBySlug(
  rawNotices: WorkspaceNotice[],
  slug: string
): { notice: WorkspaceNotice; index: number } | null {
  if (!rawNotices || !Array.isArray(rawNotices) || rawNotices.length === 0 || !slug) {
    return null;
  }

  const notices = normalizeNotices(rawNotices);
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

  // 1. Direct match by id
  const byIdIndex = notices.findIndex(
    (n) => n.id && n.id.trim().toLowerCase() === cleanSlug
  );
  if (byIdIndex !== -1) {
    return { notice: notices[byIdIndex], index: byIdIndex };
  }

  // 2. Direct match by getNoticeSlug
  const bySlugIndex = notices.findIndex(
    (n, idx) => getNoticeSlug(n, idx).toLowerCase() === cleanSlug
  );
  if (bySlugIndex !== -1) {
    return { notice: notices[bySlugIndex], index: bySlugIndex };
  }

  // 3. Match by exact title slug
  const byTitleSlugIndex = notices.findIndex(
    (n) => n.title && slugify(n.title) === cleanSlug
  );
  if (byTitleSlugIndex !== -1) {
    return { notice: notices[byTitleSlugIndex], index: byTitleSlugIndex };
  }

  // 4. Match title slug stripping trailing number suffix (-1, -2, etc.)
  const strippedSlug = cleanSlug.replace(/-\d+$/, "");
  if (strippedSlug && strippedSlug !== cleanSlug) {
    const byStrippedTitleIndex = notices.findIndex(
      (n) => n.title && slugify(n.title) === strippedSlug
    );
    if (byStrippedTitleIndex !== -1) {
      return { notice: notices[byStrippedTitleIndex], index: byStrippedTitleIndex };
    }
  }

  // 5. Match by index number (e.g. '1', '2', 'notice-1', 'notice-2', 'ntc-1')
  const numMatch = cleanSlug.match(/^(?:notice-|ntc-)?(\d+)$/) || cleanSlug.match(/-(\d+)$/);
  if (numMatch) {
    const targetIdx = parseInt(numMatch[1], 10) - 1;
    if (targetIdx >= 0 && targetIdx < notices.length) {
      return { notice: notices[targetIdx], index: targetIdx };
    }
  }

  // 6. Fuzzy substring match on title
  const fuzzyIndex = notices.findIndex(
    (n) => n.title && (slugify(n.title).includes(cleanSlug) || cleanSlug.includes(slugify(n.title)))
  );
  if (fuzzyIndex !== -1) {
    return { notice: notices[fuzzyIndex], index: fuzzyIndex };
  }

  return null;
}

