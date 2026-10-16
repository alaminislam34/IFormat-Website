import { AsyncLocalStorage } from "node:async_hooks";
import { AiFeature, Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export interface AiCallContext {
  userId?: string;
  role?: Role;
  /** Overrides the feature AIClient would otherwise infer from the endpoint it calls. */
  feature?: AiFeature;
  /** Ids of the usage log rows written during this request, oldest first. */
  usageIds: string[];
}

const storage = new AsyncLocalStorage<AiCallContext>();

export const getAiContext = () => storage.getStore();

export function runWithAiContext<T>(
  ctx: Omit<AiCallContext, "usageIds">,
  fn: () => T
): T {
  return storage.run({ ...ctx, usageIds: [] }, fn);
}

/** Route middleware: attributes every AI call made while handling this request to the user and feature. */
export const trackAi =
  (feature: AiFeature) => (req: Request, _res: Response, next: NextFunction) =>
    runWithAiContext({ userId: req.user?.id, role: req.user?.role, feature }, () => next());

/** Adds the id of the request's AI call so the client can attach feedback to it. */
export function withUsageId<T extends object>(result: T): T & { usageId?: string } {
  const ids = getAiContext()?.usageIds;
  const usageId = ids?.length ? ids[ids.length - 1] : undefined;
  return usageId ? { ...result, usageId } : result;
}
