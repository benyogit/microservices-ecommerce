# Catalogue Service

Manages the product catalogue, including products and categories. Persists
to MongoDB and publishes domain events to Kafka on create/delete.

## Structure

- `product/` — product type, Mongo repository, and service (business logic +
  Kafka events)
- `category/` — category type, Mongo repository, and service
- `infra/db/mongo.ts` — shared MongoDB connection
- `infra/kafka/producer.ts` — shared Kafka producer
- `index.ts` — single shared entry point re-exporting `product` and
  `category`, so each subfolder doesn't need its own duplicate `index.ts`

## Configuration

| Env var          | Default                  |
| ----------------- | ------------------------ |
| `MONGO_URI`       | `mongodb://localhost:27017` |
| `MONGO_DB_NAME`    | `catalogue`               |
| `KAFKA_BROKERS`    | `localhost:9092`          |
| `KAFKA_CLIENT_ID`  | `catalogue-service`       |

## Events published

- `catalogue.product`: `product.created`, `product.deleted`
- `catalogue.category`: `category.created`, `category.deleted`
