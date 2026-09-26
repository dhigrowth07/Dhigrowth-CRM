# ==============================================================================
# Multi-Stage Dockerfile for WAP PILOT (Northflank / Production Container)
# ==============================================================================

# Stage 1: Build the Vite React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install
COPY . .
RUN npm run build --workspace=frontend

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --omit=dev

# Copy server code and built frontend bundle
COPY . .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Northflank exposes the internal port configured in service settings
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "backend/index.js"]
