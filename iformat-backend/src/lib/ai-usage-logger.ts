import { randomUUID } from "node:crypto";
import { AiCallStatus, AiFeature } from "@prisma/client";
import { prisma } from "./prisma.js";
import { getAiContext } from "./ai-context.js";
import { logger } from "../utils/logger.js";
import { FREE_TIER_CODE, getEntitledSubscription } from "../utils/entitlement.js";

const MAX_ERROR_LENGTH = 300;

interface AiCallOutcome {
  status: AiCallStatus;
  latencyMs: number;
  model?: string | null;
  tokensUsed?: number;
  error?: unknown;
}

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, MAX_ERROR_LENGTH);
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && /timed out/i.test(error.message);
}

async function resolvePlanCode(userId?: string, isAdmin?: boolean): Promise<string | null> {
  if (isAdmin) return "ADMIN";
  if (!userId) return null;
  const subscription = await getEntitledSubscription(userId);
  return subscription?.plan.code ?? FREE_TIER_CODE;
}

/**
 * Runs an AI call and records one AiUsageLog row for it. The log is written in
 * the background and can never fail or slow down the AI request itself.
 */
export async function trackAiCall<T extends { model?: string; tokensUsed?: number }>(
  defaultFeature: AiFeature,
  call: () => Promise<T>
): Promise<T> {
  const ctx = getAiContext();
  const feature = ctx?.feature ?? defaultFeature;
  const id = randomUUID();
  const startedAt = Date.now();

  const record = (outcome: AiCallOutcome) => {
    ctx?.usageIds.push(id);
    void (async () => {
      try {
        const planCode = await resolvePlanCode(ctx?.userId, ctx?.role === "ADMIN");
        await prisma.aiUsageLog.create({
          data: {
            id,
            userId: ctx?.userId ?? null,
            role: ctx?.role ?? null,
            planCode,
            feature,
            status: outcome.status,
            model: outcome.model ?? null,
            tokensUsed: Math.max(0, Math.round(outcome.tokensUsed ?? 0)),
            latencyMs: outcome.latencyMs,
            errorMessage: outcome.error ? describeError(outcome.error) : null,
          },
        });
      } catch (err: any) {
        logger.error(`Failed to write AI usage log (${feature}): ${err?.message}`);
      }
    })();
  };

  try {
    const result = await call();
    record({
      status: AiCallStatus.SUCCESS,
      latencyMs: Date.now() - startedAt,
      model: result?.model,
      tokensUsed: result?.tokensUsed,
    });
    return result;
  } catch (error) {
    record({
      status: isTimeout(error) ? AiCallStatus.TIMEOUT : AiCallStatus.ERROR,
      latencyMs: Date.now() - startedAt,
      error,
    });
    throw error;
  }
}
