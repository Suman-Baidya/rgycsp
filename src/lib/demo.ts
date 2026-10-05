/**
 * Demo Showcase Identity & Restriction Utility
 *
 * Provides central identification and enforcement for the Showcase Super Admin demo account.
 * When ENABLE_DEMO_RESTRICTIONS is "true", any mutations (creating, updating, deleting,
 * password changing, or file uploading) initiated by the demo user are strictly blocked.
 */

export function getDemoEmail(): string {
  const email = process.env.DEMO_ADMIN_EMAIL || process.env.NEXT_PUBLIC_DEMO_EMAIL || "";
  return email.trim().toLowerCase();
}

export function isDemoRestrictionsEnabled(): boolean {
  return process.env.ENABLE_DEMO_RESTRICTIONS === "true";
}

export function isDemoEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const demoEmail = getDemoEmail();
  if (!demoEmail) return false;
  return email.trim().toLowerCase() === demoEmail;
}

export function isDemoTargetAccount(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  const configured = getDemoEmail();
  if (configured && clean === configured) return true;
  if (clean === "demoadmin@abcd.com") return true;
  return false;
}

export function isDemoUser(user?: { email?: string | null; isDemo?: boolean } | null): boolean {
  if (!user) return false;
  if (!isDemoRestrictionsEnabled()) return false;
  if (user.isDemo === true) return true;
  return isDemoEmail(user.email);
}

/**
 * Mask sensitive API secrets (e.g. Razorpay, Cloudinary, SMTP keys)
 * for safe rendering during client demonstrations.
 */
export function maskSecret(secret?: string | null, keepChars: number = 4): string {
  if (!secret) return "";
  if (secret.length <= keepChars * 2) {
    return "••••••••••••";
  }
  const start = secret.slice(0, keepChars);
  return `${start}${"•".repeat(12)}`;
}

/**
 * Server Action Guard: Quickly check if current session is demo user.
 * Returns { isDemo: true, error } so server actions can return clean toast-compatible error objects.
 */
export async function assertNotDemo(
  customMessage: string = "You Can't Edit as Demo Preview"
) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (isDemoUser(session?.user)) {
      return { isDemo: true, error: customMessage, session };
    }
    return { isDemo: false, error: null, session };
  } catch {
    return { isDemo: false, error: null, session: null };
  }
}
