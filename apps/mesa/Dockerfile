# ── Stage 1: Install dependencies ──────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

ARG CACHEBUST=9
RUN echo "cachebust=$CACHEBUST"

# Install libc6-compat for alpine compatibility
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

# ── Stage 2: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for public env vars baked at build time
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL
ARG N8N_WEBHOOK_BASE_URL
ARG SUPABASE_SERVICE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL=$NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL
ENV N8N_WEBHOOK_BASE_URL=$N8N_WEBHOOK_BASE_URL
ENV SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# Enable standalone output in next.config
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Runtime ───────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy built artifacts from standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
