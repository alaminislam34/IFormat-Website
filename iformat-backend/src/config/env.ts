import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5001),
  API_VERSION: z.string().default("v1"),

  // Database
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/iformat_db?schema=public"),

  // JWT
  JWT_ACCESS_SECRET: z.string().default("18d14609b665e93146b4d6c839291f97ebfde462ee570fa6ebc3004008ff1722"),
  JWT_REFRESH_SECRET: z.string().default("68293e36000c79f8c0206b31b735fffae1903790b1cdcbd90f155832770a1877"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Cookie
  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // OpenAI
  OPENAI_API_KEY: z.string().optional().default("sk-mock-key"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional().default("mock-google-client-id"),
  GOOGLE_CLIENT_SECRET: z.string().optional().default("mock-google-client-secret"),
  GOOGLE_CALLBACK_URL: z.string().default("http://localhost:5001/api/v1/oauth/google/callback"),
  OAUTH_SUCCESS_REDIRECT_URL: z.string().default("http://localhost:3000/account-type"),
  OAUTH_FAILURE_REDIRECT_URL: z.string().default("http://localhost:3000/login?error=oauth_failed"),

  // Stripe
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional().default("sk_test_mock_stripe_key"),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default("whsec_mock_key"),
  STRIPE_CONNECT_WEBHOOK_SECRET: z.string().optional(),
  PRODUCT_ID: z.string().optional(),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional().default("mock_aws_key"),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default("mock_aws_secret"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().default("iformat-bucket"),

  // SMTP (Amazon SES / SMTP)
  SMTP_HOST: z.string().default("email-smtp.ca-central-1.amazonaws.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("iFormat <devamin.bd@gmail.com>"),

  // Redis
  REDIS_URL: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables configuration:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  // Prisma reads process.env.DATABASE_URL from schema.prisma, not the Zod object.
  for (const [key, value] of Object.entries(result.data)) {
    if (process.env[key] === undefined && value !== undefined) {
      process.env[key] = String(value);
    }
  }

  return result.data;
};

export const env = parseEnv();
