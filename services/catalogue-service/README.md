# Catalogue Service

Manages the product catalogue, including products and categories. Persists
to MongoDB and publishes domain events to Kafka on create/delete.

## Structure

- `product/` — product type, Mongo repository, service (business logic +
  Kafka events), controller, and routes
- `category/` — category type, Mongo repository, service, controller, and
  routes
- `infra/db/mongo.ts` — shared MongoDB connection
- `infra/kafka/producer.ts` — shared Kafka producer
- `infra/http/asyncHandler.ts` — wraps async route handlers so rejected
  promises reach Express's error middleware instead of crashing the process
- `app.ts` — builds the Express app and mounts the routers
- `server.ts` — starts the HTTP server
- `index.ts` — single shared entry point re-exporting `product` and
  `category`, so each subfolder doesn't need its own duplicate `index.ts`

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
