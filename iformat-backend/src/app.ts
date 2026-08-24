import express, { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import { NotFoundError } from "./errors/index.js";
import { passport } from "./lib/passport.js";

const app: Express = express();

// 1. Security & Protection Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [env.CORS_ORIGIN, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(hpp());

// 2. Cookie & Body Parsers (with rawBody capture for Stripe webhook verification)
app.use(cookieParser());
app.use(
  express.json({
    limit: "10mb",
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Passport Initialization
app.use(passport.initialize());

// 4. Rate Limiting
app.use(apiLimiter);

// 5. API Routes Mount
app.use(`/api/${env.API_VERSION}`, apiRouter);

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "iFormat API is running",
    data: {
      apiBase: `/api/${env.API_VERSION}`,
      health: `/api/${env.API_VERSION}/health`,
    },
  });
});

// Chrome DevTools probes this path on open ports; it is not an API route.
app.get("/json/version", (_req: Request, res: Response) => {
  res.status(404).end();
});

// 6. 404 Not Found Handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route '${req.originalUrl}'`));
});

// 7. Global Error Handler
app.use(errorHandler);

export { app };
