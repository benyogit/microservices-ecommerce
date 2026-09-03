# Catalogue Service

Manages the product catalogue, including products and categories. Persists
to MongoDB and publishes domain events to Kafka on create/delete.

## Structure

- `product/` — `ProductRepository` interface + `MongoProductRepository`,
  `ProductService` (business logic + Kafka events), `ProductController`,
  and routes
- `category/` — same shape as `product/`, for categories
- `infra/db/mongo.ts` — injectable `MongoConnection`
- `infra/events/event-publisher.ts` — `EventPublisher` interface (lets the
  Kafka producer be swapped for another queue, or wrapped with caching,
  without touching the services)
- `infra/kafka/producer.ts` — `KafkaEventPublisher`, the current
  `EventPublisher` implementation
- `infra/http/asyncHandler.ts` — wraps async route handlers so rejected
  promises reach Express's error middleware instead of crashing the process
- `infra/di/types.ts` / `infra/di/container.ts` — Inversify DI: symbol
  tokens and the composition root binding each interface to its current
  implementation
- `app.ts` — builds the Express app and mounts the routers
- `server.ts` — starts the HTTP server
- `index.ts` — single shared entry point re-exporting `product` and
  `category`, so each subfolder doesn't need its own duplicate `index.ts`

## Dependency injection

Repositories and the event publisher are bound behind interfaces
(`ProductRepository`, `CategoryRepository`, `EventPublisher`) in
`infra/di/container.ts`, and constructor-injected into services and
controllers via Inversify (`@injectable()` / `@inject()`). To add caching
or swap Kafka for another queue locally, implement the relevant interface
and change its binding in `container.ts` — no changes needed in the
services or controllers.

## HTTP API

| Method | Path             | Description       |
| ------ | ---------------- | ------------------ |
| GET    | `/products`      | List products      |
| GET    | `/products/:id`  | Get a product      |
| POST   | `/products`      | Create a product    |
| DELETE | `/products/:id`  | Delete a product    |
| GET    | `/categories`     | List categories     |
| GET    | `/categories/:id` | Get a category      |
| POST   | `/categories`     | Create a category    |
| DELETE | `/categories/:id` | Delete a category    |

Run with `npm run dev` (or `npm run build && npm start`). Listens on `PORT`
(default `3000`).

## Configuration

| Env var          | Default                  |
| ----------------- | ------------------------ |
| `MONGO_URI`       | `mongodb://localhost:27017` |
| `MONGO_DB_NAME`    | `catalogue`               |
| `KAFKA_BROKERS`    | `localhost:9092`          |
| `KAFKA_CLIENT_ID`  | `catalogue-service`       |
| `PRODUCT_TOPIC`    | `catalogue.product`       |
| `CATEGORY_TOPIC`   | `catalogue.category`      |

## Events published

- `PRODUCT_TOPIC` (default `catalogue.product`): `product.created`, `product.deleted`
- `CATEGORY_TOPIC` (default `catalogue.category`): `category.created`, `category.deleted`

## Auth

This service performs no JWT/auth validation of its own — authentication
and authorization are handled upstream by an API gateway (e.g. AWS API
Gateway) or another dedicated service before requests reach it.
