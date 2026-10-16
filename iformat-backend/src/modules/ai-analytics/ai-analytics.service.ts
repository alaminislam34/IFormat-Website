import { AiCallStatus, AiFeedbackRating, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { SUPER_ADMIN_EMAILS, superAdminUserConditions } from "../../config/super-admin.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_RANGES = [7, 30, 90];

const toNumber = (value: unknown): number => Number(value ?? 0);
const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export class AiAnalyticsService {
  static normalizeDays(raw: unknown): number {
    const days = Number(raw);
    return ALLOWED_RANGES.includes(days) ? days : 30;
  }

  /** Cost is only an estimate: the AI service reports total tokens, priced at one blended rate. */
  private static estimateCost(tokens: number): number | null {
    const rate = env.AI_COST_PER_1M_TOKENS_USD;
    return rate > 0 ? round((tokens / 1_000_000) * rate, 4) : null;
  }

  static async getOverview(rawDays: unknown) {
    const days = this.normalizeDays(rawDays);
    const since = new Date(Date.now() - days * DAY_MS);

    // Super admins stay invisible in admin analytics, like everywhere else in the admin portal.
    const where: Prisma.AiUsageLogWhereInput = {
      createdAt: { gte: since },
      ...(SUPER_ADMIN_EMAILS.length
        ? { OR: [{ userId: null }, { user: { NOT: superAdminUserConditions() } }] }
        : {}),
    };
    const hideSuperAdminsSql = SUPER_ADMIN_EMAILS.length
      ? Prisma.sql`AND (l."userId" IS NULL OR l."userId" NOT IN (
          SELECT u."id" FROM "User" u WHERE lower(u."email") IN (${Prisma.join(SUPER_ADMIN_EMAILS)})
        ))`
      : Prisma.empty;

    const [
      totals,
      byStatus,
      byFeatureRows,
      byFeatureStatus,
      byFeatureRating,
      byPlanRows,
      topUserRows,
      latency,
      dailyRows,
      recentErrors,
      recentFeedback,
    ] = await Promise.all([
      prisma.aiUsageLog.aggregate({
        where,
        _count: { _all: true },
        _sum: { tokensUsed: true },
        _avg: { latencyMs: true },
      }),
      prisma.aiUsageLog.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.aiUsageLog.groupBy({
        by: ["feature"],
        where,
        _count: { _all: true },
        _sum: { tokensUsed: true },
        _avg: { latencyMs: true },
      }),
      prisma.aiUsageLog.groupBy({ by: ["feature", "status"], where, _count: { _all: true } }),
      prisma.aiUsageLog.groupBy({
        by: ["feature", "feedbackRating"],
        where: { ...where, feedbackRating: { not: null } },
        _count: { _all: true },
      }),
      prisma.aiUsageLog.groupBy({
        by: ["planCode"],
        where,
        _count: { _all: true },
        _sum: { tokensUsed: true },
      }),
      prisma.aiUsageLog.groupBy({
        by: ["userId"],
        where: { ...where, userId: { not: null } },
        _count: { _all: true },
        _sum: { tokensUsed: true },
        orderBy: { _sum: { tokensUsed: "desc" } },
        take: 10,
      }),
      prisma.$queryRaw<{ p95: number | null }[]>`
        SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY l."latencyMs") AS p95
        FROM "AiUsageLog" l
        WHERE l."createdAt" >= ${since} ${hideSuperAdminsSql}`,
      prisma.$queryRaw<
        { day: Date; calls: bigint; errors: bigint; tokens: bigint }[]
      >`
        SELECT date_trunc('day', l."createdAt") AS day,
               count(*) AS calls,
               count(*) FILTER (WHERE l."status" <> 'SUCCESS') AS errors,
               coalesce(sum(l."tokensUsed"), 0) AS tokens
        FROM "AiUsageLog" l
        WHERE l."createdAt" >= ${since} ${hideSuperAdminsSql}
        GROUP BY 1 ORDER BY 1`,
      prisma.aiUsageLog.findMany({
        where: { ...where, status: { not: AiCallStatus.SUCCESS } },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true, feature: true, status: true, errorMessage: true, latencyMs: true,
          createdAt: true, user: { select: { name: true, email: true } },
        },
      }),
      prisma.aiUsageLog.findMany({
        where: { ...where, feedbackRating: { not: null } },
        orderBy: { feedbackAt: "desc" },
        take: 20,
        select: {
          id: true, feature: true, feedbackRating: true, feedbackComment: true, feedbackAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    const totalCalls = totals._count._all;
    const totalTokens = totals._sum.tokensUsed ?? 0;
    const failedCalls = byStatus
      .filter((s) => s.status !== AiCallStatus.SUCCESS)
      .reduce((sum, s) => sum + s._count._all, 0);

    const countFor = (feature: string, status: AiCallStatus) =>
      byFeatureStatus.find((r) => r.feature === feature && r.status === status)?._count._all ?? 0;
    const ratingFor = (feature: string, rating: AiFeedbackRating) =>
      byFeatureRating.find((r) => r.feature === feature && r.feedbackRating === rating)?._count._all ?? 0;

    const features = byFeatureRows
      .map((row) => {
        const calls = row._count._all;
        const tokens = row._sum.tokensUsed ?? 0;
        const up = ratingFor(row.feature, AiFeedbackRating.UP);
        const down = ratingFor(row.feature, AiFeedbackRating.DOWN);
        const failed = calls - countFor(row.feature, AiCallStatus.SUCCESS);
        return {
          feature: row.feature,
          calls,
          failed,
          errorRate: calls ? round((failed / calls) * 100, 1) : 0,
          tokens,
          estimatedCostUsd: this.estimateCost(tokens),
          avgLatencyMs: round(row._avg.latencyMs ?? 0),
          thumbsUp: up,
          thumbsDown: down,
          satisfaction: up + down ? round((up / (up + down)) * 100) : null,
        };
      })
      .sort((a, b) => b.calls - a.calls);

    const users = topUserRows.length
      ? await prisma.user.findMany({
          where: { id: { in: topUserRows.map((r) => r.userId!) } },
          select: { id: true, name: true, email: true, role: true },
        })
      : [];

    return {
      rangeDays: days,
      costRatePer1MTokensUsd: env.AI_COST_PER_1M_TOKENS_USD || null,
      summary: {
        totalCalls,
        failedCalls,
        successRate: totalCalls ? round(((totalCalls - failedCalls) / totalCalls) * 100, 1) : 100,
        totalTokens,
        estimatedCostUsd: this.estimateCost(totalTokens),
        avgLatencyMs: round(totals._avg.latencyMs ?? 0),
        p95LatencyMs: round(toNumber(latency[0]?.p95)),
        thumbsUp: features.reduce((sum, f) => sum + f.thumbsUp, 0),
        thumbsDown: features.reduce((sum, f) => sum + f.thumbsDown, 0),
      },
      features,
      plans: byPlanRows
        .map((row) => ({
          planCode: row.planCode ?? "UNKNOWN",
          calls: row._count._all,
          tokens: row._sum.tokensUsed ?? 0,
          estimatedCostUsd: this.estimateCost(row._sum.tokensUsed ?? 0),
        }))
        .sort((a, b) => b.calls - a.calls),
      daily: dailyRows.map((row) => ({
        date: row.day.toISOString().slice(0, 10),
        calls: toNumber(row.calls),
        errors: toNumber(row.errors),
        tokens: toNumber(row.tokens),
      })),
      topUsers: topUserRows.map((row) => {
        const user = users.find((u) => u.id === row.userId);
        const tokens = row._sum.tokensUsed ?? 0;
        return {
          userId: row.userId,
          name: user?.name ?? "Deleted user",
          email: user?.email ?? null,
          role: user?.role ?? null,
          calls: row._count._all,
          tokens,
          estimatedCostUsd: this.estimateCost(tokens),
        };
      }),
      recentErrors,
      recentFeedback,
    };
  }
}
