# ── Stage 1: Clone + Install ───────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat git

ARG CACHEBUST=4
RUN echo "cachebust=$CACHEBUST"

RUN git clone --depth=1 --branch claude/integrate-systems-n8n-J1yuM \
    https://github.com/alexanderestradaconsuegra-tech/gastro.git /repo

WORKDIR /repo/apps/landing
RUN npm ci

# ── Stage 2: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /repo/apps/landing

COPY --from=deps /repo/apps/landing/node_modules ./node_modules
COPY --from=deps /repo/apps/landing .

ARG N8N_WEBHOOK_BASE_URL
ARG ADMIN_URL

ENV N8N_WEBHOOK_BASE_URL=$N8N_WEBHOOK_BASE_URL
ENV ADMIN_URL=$ADMIN_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Runtime ───────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/landing/.next/static    ./.next/static

USER nextjs

EXPOSE 3002

CMD ["node", "server.js"]
