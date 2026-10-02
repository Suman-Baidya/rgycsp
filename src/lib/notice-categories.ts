/**
 * Single source of truth for Notice Categories across the platform.
 * Used by: FranchiseEventsNoticesClient, SuperAdminEventsNoticesClient, StudentNoticesClient
 */

export const NOTICE_CATEGORIES = ["General", "Academic", "Exams", "Holidays"] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

/** Canonicalize any stored string into a valid NoticeCategory */
export function normalizeCategory(cat?: string | null): NoticeCategory {
  if (!cat) return "General";
  const c = cat.trim();
  // Exact match (case-insensitive)
  const exact = NOTICE_CATEGORIES.find((k) => k.toLowerCase() === c.toLowerCase());
  if (exact) return exact;
  // Fuzzy fallback
  const cl = c.toLowerCase();
  if (/exam|test|admit/.test(cl)) return "Exams";
  if (/holiday|vacation|closure/.test(cl)) return "Holidays";
  if (/academic|course|batch|class/.test(cl)) return "Academic";
  return "General";
}

/** Colour + label metadata for each category (clean, professional, no emojis) */
export const CATEGORY_META: Record<
  NoticeCategory,
  { label: string; color: string; bg: string; border: string }
> = {
  General: {
    label: "General Notice",
    color: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
  },
  Academic: {
    label: "Academic",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  Exams: {
    label: "Exams & Tests",
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-900/30",
    border: "border-purple-200 dark:border-purple-800",
  },
  Holidays: {
    label: "Holidays & Closures",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
};

/** Request categories for Franchise -> Super Admin support communication */
export const REQUEST_CATEGORIES = [
  { value: "General", label: "General Support", badgeColor: "slate" },
  { value: "Technical", label: "Technical Support", badgeColor: "sky" },
  { value: "Financial", label: "Financial & Wallet", badgeColor: "emerald" },
  { value: "Operational", label: "Center Operations", badgeColor: "indigo" },
  { value: "Complaint", label: "Complaint & Grievance", badgeColor: "rose" },
] as const;

export type RequestCategory = (typeof REQUEST_CATEGORIES)[number]["value"];

