# syntax=docker/dockerfile:1
#
# Build context is the REPO ROOT (`docker build -f services/catalogue-service/Dockerfile .`
# from the repo root, or via the root docker-compose.yml) — this service
# depends on the @microservices-ecommerce/event-bus workspace package in
# packages/event-bus, which a context scoped to this folder can't see.

FROM node:20-alpine AS base
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/event-bus/package.json packages/event-bus/package.json
COPY services/catalogue-service/package.json services/catalogue-service/package.json

# ---- development: full deps, source mounted at runtime, hot reload ----
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY packages/event-bus packages/event-bus
COPY services/catalogue-service services/catalogue-service
RUN npm run build --workspace=packages/event-bus
WORKDIR /repo/services/catalogue-service
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- build: compile both the shared package and this service to dist/ ----
FROM base AS build
RUN npm ci
COPY packages/event-bus packages/event-bus
COPY services/catalogue-service services/catalogue-service
RUN npm run build --workspace=packages/event-bus
RUN npm run build --workspace=services/catalogue-service

# ---- production: minimal runtime image, only dist/ + prod deps ----
FROM node:20-alpine AS production
WORKDIR /repo
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json package-lock.json ./
COPY packages/event-bus/package.json packages/event-bus/package.json
COPY services/catalogue-service/package.json services/catalogue-service/package.json
RUN npm ci --omit=dev
COPY --from=build /repo/packages/event-bus/dist packages/event-bus/dist
COPY --from=build /repo/services/catalogue-service/dist services/catalogue-service/dist
WORKDIR /repo/services/catalogue-service
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "dist/server.js"]
