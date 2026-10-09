# ==============================================================================
# Stage 1: Base Image with Node & Corepack (pnpm)
# ==============================================================================
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# ==============================================================================
# Stage 2: Install Dependencies & Generate Prisma Client
# ==============================================================================
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma

RUN --mount=type=cache,id=pnpm-backend,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm prisma generate

# ==============================================================================
# Stage 3: Build TypeScript Code
# ==============================================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN pnpm build

# Prune dev dependencies for lean production container
RUN pnpm prune --prod

# ==============================================================================
# Stage 4: Production Runner
# ==============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Run as unprivileged node user
RUN apk add --no-cache openssl wget

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/views ./src/views
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh && \
    chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/v1/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
