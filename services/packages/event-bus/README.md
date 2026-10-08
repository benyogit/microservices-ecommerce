# @microservices-ecommerce/event-bus

Shared `EventPublisher` interface plus its two real implementations
(`KafkaEventPublisher`, `RabbitMQEventPublisher`), used by every service
that publishes domain events. Extracted from catalogue-service and
cart-service once those two had three byte-for-byte-identical files —
the interface and the RabbitMQ implementation had no per-service
differences at all, and the Kafka one differed only in a default string
that's already overridable via `KAFKA_CLIENT_ID`.

## What's intentionally *not* here

Anything service-specific: database connections (Mongo, Redis), the S3
media storage client, the HTTP client to catalogue-service. Those differ
per service and should stay duplicated-by-design rather than forced into
a shared package — see the root README's npm-workspaces write-up for the
reasoning (share rarely-changing infra, never domain code).

## Building

This package ships compiled JS (`main`/`types` point at `dist/`), so
consumers never compile its TypeScript themselves. After editing
anything in `src/`, rebuild it before a dependent service picks up the
change:

```
npm run build --workspace=packages/event-bus
```

`npm run dev` in a service does **not** rebuild this package
automatically — it's expected to change rarely. If you're actively
iterating on both at once, run `npx tsc --watch` in this folder in a
second terminal.

## Usage

```ts
import { EventPublisher, KafkaEventPublisher, RabbitMQEventPublisher } from '@microservices-ecommerce/event-bus';
```

A consuming service's `utils/di/container.ts` binds `EventPublisher` to
whichever implementation `EVENT_BUS` selects — see either service's
README for that env var.
