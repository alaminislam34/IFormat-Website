import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info(" Connected to PostgreSQL database via Prisma");
  } catch (error) {
    if (env.NODE_ENV === "development") {
      logger.warn(
        "PostgreSQL is not reachable at DATABASE_URL. API will start without a database. Start Postgres on localhost:5432 to enable persistence."
      );
    } else {
      logger.error("Failed to connect to database:", error);
      process.exit(1);
    }
  }
};
