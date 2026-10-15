import { env } from "./env.js";

export const SUPER_ADMIN_EMAILS: readonly string[] = env.SUPER_ADMIN_EMAILS.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isSuperAdminEmail(email?: string | null): boolean {
  return !!email && SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Prisma conditions (for use inside `NOT: [...]`) matching super admin users.
 */
export function superAdminUserConditions() {
  return SUPER_ADMIN_EMAILS.map((email) => ({
    email: { equals: email, mode: "insensitive" as const },
  }));
}
