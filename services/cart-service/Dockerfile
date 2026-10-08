# syntax=docker/dockerfile:1
#
# Build context is the `services/` folder (`docker build -f
# cart-service/Dockerfile .` from inside services/, or via
# services/docker-compose.yml) — this service depends on the
# @microservices-ecommerce/event-bus workspace package in
# packages/event-bus, a sibling under services/, which a context scoped
# to just this folder can't see.

FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/event-bus/package.json packages/event-bus/package.json
COPY cart-service/package.json cart-service/package.json

# ---- development: full deps, source mounted at runtime, hot reload ----
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY packages/event-bus packages/event-bus
COPY cart-service cart-service
RUN npm run build --workspace=packages/event-bus
WORKDIR /app/cart-service
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ---- build: compile both the shared package and this service to dist/ ----
FROM base AS build
RUN npm ci
COPY packages/event-bus packages/event-bus
COPY cart-service cart-service
RUN npm run build --workspace=packages/event-bus
RUN npm run build --workspace=cart-service

# ---- production: minimal runtime image, only dist/ + prod deps ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY package.json package-lock.json ./
COPY packages/event-bus/package.json packages/event-bus/package.json
COPY cart-service/package.json cart-service/package.json
RUN npm ci --omit=dev
COPY --from=build /app/packages/event-bus/dist packages/event-bus/dist
COPY --from=build /app/cart-service/dist cart-service/dist
WORKDIR /app/cart-service
EXPOSE 3001
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "dist/server.js"]
