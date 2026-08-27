import { z } from "zod";

/**
 * Frontend Runtime & Build-time Environment Variable Schema
 * Validates critical environment variables to prevent silent client-side breakage.
 */
const frontendEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .default(
      process.env.NODE_ENV === "production"
        ? "/api/v1"
        : "http://localhost:5000/api/v1"
    ),
  NEXT_PUBLIC_USE_MOCK: z
    .enum(["true", "false"])
    .default("false"),
});

const parseFrontendEnv = () => {
  const parsed = frontendEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
  });

  if (!parsed.success) {
    console.warn(
      "⚠️ [iFormat Frontend] Non-fatal environment variable configuration warning:",
      parsed.error.format()
    );
    return {
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production" ? "/api/v1" : "http://localhost:5000/api/v1"),
      NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || "false",
    };
  }

  return parsed.data;
};

export const frontendEnv = parseFrontendEnv();
