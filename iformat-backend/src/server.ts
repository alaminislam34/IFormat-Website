import { createServer } from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { connectDatabase, prisma } from "./lib/prisma.js";

const server = createServer(app);

const startServer = async () => {
  try {
    // 1. Connect to PostgreSQL via Prisma
    await connectDatabase();

    // 2. Start HTTP Server
    server.listen(env.PORT, () => {
      logger.info(
        `🚀 iFormat Backend Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
      );
      logger.info(
        `📡 API Base: http://localhost:${env.PORT}/api/${env.API_VERSION}`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await prisma.$disconnect();
      logger.info("Database connection closed.");
      process.exit(0);
    } catch (err) {
      logger.error("Error during database disconnect:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if hanging
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
