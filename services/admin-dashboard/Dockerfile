# syntax=docker/dockerfile:1.4
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# ============================================
# Stage 1: Build the shared UI components library
# ============================================
# Copy from the named build context "ui-components"
COPY --from=ui-components packages/ui-components /shared-ui-components

WORKDIR /shared-ui-components

# Install dependencies and build the shared library
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install && npm run build

# Create tarball from the built package
RUN npm pack --pack-destination /shared-ui-components

# ============================================
# Stage 2: Build the admin-dashboard application
# ============================================
WORKDIR /app

# Copy package files
COPY services/admin-dashboard/package*.json ./

# Install dependencies (tarball path must match package.json reference)
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install

# Copy source code
COPY services/admin-dashboard/ ./

# Ensure public directory exists
RUN mkdir -p public

# Build the application
RUN npm run build

# ============================================
# Production stage
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3001 || exit 1

CMD ["node", "server.js"]

