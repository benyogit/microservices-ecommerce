# Catalogue Service

Manages the product catalogue, including products and categories. Persists
to MongoDB and publishes domain events to Kafka on create/delete.

## Structure

- `product/` — `ProductRepository` interface + `MongoProductRepository`,
  `ProductService` (business logic + Kafka events), `ProductController`,
  routes, and a `product.schema.ts` zod schema for request validation
- `category/` — same shape as `product/`, for categories
- `infra/db/mongo.ts` — injectable `MongoConnection`
- `infra/events/event-publisher.ts` — `EventPublisher` interface (lets the
  Kafka producer be swapped for another queue, or wrapped with caching,
  without touching the services)
- `infra/kafka/producer.ts` — `KafkaEventPublisher`, the current
  `EventPublisher` implementation
- `infra/storage/media-storage.ts` — `MediaStorage` interface: returns a
  signed URL clients can upload an image/video to directly, without the
  service caring which provider is behind it (S3, Azure Blob, ...)
- `infra/storage/s3-media-storage.ts` — `S3MediaStorage`, the current
  `MediaStorage` implementation (S3 presigned PUT URLs)
- `utils/http/asyncHandler.ts` — wraps async route handlers so rejected
  promises reach Express's error middleware instead of crashing the process
- `utils/http/validate.ts` — `validateBody(schema)` middleware: 400s with
  field-level errors on an invalid request body, otherwise replaces
  `req.body` with the parsed/typed value
- `utils/di/types.ts` / `utils/di/container.ts` — Inversify DI: symbol
  tokens and the composition root binding each interface to its current
  implementation
- `utils/` holds this kind of internal wiring/helpers; `infra/` is
  reserved for layers that talk to an outer service (Mongo, Kafka, S3)
- `app.ts` — builds the Express app, mounts the routers, and serves the
  OpenAPI spec at `GET /openapi.yaml`
- `server.ts` — starts the HTTP server
- `index.ts` — single shared entry point re-exporting `product` and
  `category`, so each subfolder doesn't need its own duplicate `index.ts`
- `openapi.yaml` — the OpenAPI 3.0 spec for this service's HTTP API

## Dependency injection

Repositories, the event publisher, and media storage are bound behind
interfaces (`ProductRepository`, `CategoryRepository`, `EventPublisher`,
`MediaStorage`) in `utils/di/container.ts`, and constructor-injected into
services and controllers via Inversify (`@injectable()` / `@inject()`). To
add caching, swap Kafka for another queue, or swap S3 for Azure Blob
locally, implement the relevant interface and change its binding in
`container.ts` — no changes needed in the services or controllers.

## HTTP API

| Method | Path             | Description       |
| ------ | ---------------- | ------------------ |
| GET    | `/products`      | List products      |
| GET    | `/products/:id`  | Get a product      |
| POST   | `/products`      | Create a product (validated body); returns `{ product, imageUploadUrl }` — the client uploads the image directly to `imageUploadUrl` (a signed PUT URL) |
| DELETE | `/products/:id`  | Delete a product    |
| GET    | `/categories`     | List categories     |
| GET    | `/categories/:id` | Get a category      |
| POST   | `/categories`     | Create a category (validated body) |
| DELETE | `/categories/:id` | Delete a category    |
| GET    | `/openapi.yaml`   | The OpenAPI 3.0 spec for this API |

Run with `npm run dev` (or `npm run build && npm start`). Listens on `PORT`
(default `3000`).

## Request validation

`POST /products` and `POST /categories` validate the request body against
a zod schema (`product/product.schema.ts`, `category/category.schema.ts`)
via the `validateBody` middleware. An invalid body gets a `400` with
field-level errors instead of reaching the service/repository layer.

## OpenAPI

`openapi.yaml` at the service root is the source of truth for this
service's HTTP API and is served live at `GET /openapi.yaml`, so other
services (an API gateway, a client generator, another team) can fetch it
without needing this repo. Keep it in sync with `product/product.routes.ts`
/ `category/category.routes.ts` and the zod schemas when the API changes.

## Configuration

| Env var          | Default                  |
| ----------------- | ------------------------ |
| `MONGO_URI`       | `mongodb://localhost:27017` |
| `MONGO_DB_NAME`    | `catalogue`               |
| `KAFKA_BROKERS`    | `localhost:9092`          |
| `KAFKA_CLIENT_ID`  | `catalogue-service`       |
| `PRODUCT_TOPIC`    | `catalogue.product`       |
| `CATEGORY_TOPIC`   | `catalogue.category`      |
| `STORAGE_BUCKET`   | `catalogue-media`         |
| `AWS_REGION`       | `us-east-1`               |
| `STORAGE_UPLOAD_URL_TTL_SECONDS` | `900`       |

AWS credentials for `S3MediaStorage` are picked up from the standard AWS
SDK credential chain (env vars, shared config, instance/task role) — none
are hardcoded here.

## Events published

- `PRODUCT_TOPIC` (default `catalogue.product`): `product.created`, `product.deleted`
- `CATEGORY_TOPIC` (default `catalogue.category`): `category.created`, `category.deleted`

## Auth

This service performs no JWT/auth validation of its own — authentication
and authorization are handled upstream by an API gateway (e.g. AWS API
Gateway) or another dedicated service before requests reach it.
