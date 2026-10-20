import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const FREE_TIER_CODE = "FREE_TIER";
export const FREE_TIER_MONTHLY_AI_LIMIT = 5;
export const FREE_TIER_MONTHLY_JOB_ANALYSIS_LIMIT = 5;
export const FREE_TIER_MAX_ACTIVE_JOBS = 1;
export const FREE_TIER_MONTHLY_APPLICATIONS_LIMIT = 10;

/**
 * Current UTC month window; the single source of truth for usage periods.
 */
export function getCurrentBillingCycleUtc() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { periodStart, periodEnd };
}

/**
 * The user's subscription if it currently grants paid entitlements
 * (ACTIVE or TRIALING and not past its period end), with its plan.
 */
export async function getEntitledSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }],
    },
    include: { plan: true },
  });
}

/**
 * Admin-editable free tier plan row (null if not seeded yet).
 */
export async function getFreeTierPlan() {
  return prisma.plan.findUnique({ where: { code: FREE_TIER_CODE } });
}

/**
 * Reads the monthly AI generation cap from a plan's customFeatures.
 * - number          -> that cap
 * - explicit null   -> unlimited
 * - missing/array   -> `fallback` (null = unlimited)
 */
export function readAiLimit(customFeatures: unknown, fallback: number | null): number | null {
  if (customFeatures && typeof customFeatures === "object" && !Array.isArray(customFeatures)) {
    const value = (customFeatures as Record<string, unknown>).maxAiGenerations;
    if (typeof value === "number") return value;
    if (value === null) return null;
  }
  return fallback;
}

/**
 * Reads the monthly job analyzer cap from a plan's customFeatures (same rules as readAiLimit).
 */
export function readJobAnalysisLimit(customFeatures: unknown, fallback: number | null): number | null {
  if (customFeatures && typeof customFeatures === "object" && !Array.isArray(customFeatures)) {
    const value = (customFeatures as Record<string, unknown>).maxJobAnalyses;
    if (typeof value === "number") return value;
    if (value === null) return null;
  }
  return fallback;
}

/**
 * Clears this month's AI usage so a plan change takes effect immediately.
 */
export async function resetMonthlyAiUsage(userId: string) {
  const { periodStart, periodEnd } = getCurrentBillingCycleUtc();
  await prisma.subscriptionUsage.updateMany({
    where: { userId, periodStart, periodEnd },
    data: { aiGenerationsCount: 0, jobAnalysesCount: 0 },
  });
}

export type LimitOverrideKey = "maxAiGenerations" | "maxJobAnalyses" | "maxActiveJobs" | "maxApplicationsPerMonth";

export const LIMIT_OVERRIDE_KEYS: LimitOverrideKey[] = [
  "maxAiGenerations",
  "maxJobAnalyses",
  "maxActiveJobs",
  "maxApplicationsPerMonth",
];

/**
 * Applies an admin per-user override on top of the plan-derived limit.
 * - number          -> that cap
 * - explicit null   -> unlimited
 * - key missing     -> `planLimit` (null = unlimited)
 */
export function applyLimitOverride(
  overrides: unknown,
  key: LimitOverrideKey,
  planLimit: number | null
): number | null {
  if (overrides && typeof overrides === "object" && !Array.isArray(overrides)) {
    const value = (overrides as Record<string, unknown>)[key];
    if (typeof value === "number") return value;
    if (value === null) return null;
  }
  return planLimit;
}

export async function getUserLimitOverrides(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { limitOverrides: true },
  });
  return user?.limitOverrides ?? null;
}
