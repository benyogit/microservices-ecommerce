# Cart Service

Manages per-user shopping carts. Backed by Redis, not MongoDB — cart data
is high-churn and often abandoned, and Redis's native key TTL expires
stale carts automatically instead of needing a cleanup job.

## Structure

- `features/cart/` — `Cart`/`CartItem` types, `CartRepository` interface +
  `RedisCartRepository`, `CartService` (business logic + Kafka events),
  `CartController`, routes, and `cart.schema.ts` (zod)
- `infra/db/redis.ts` — injectable `RedisConnection`. Bounds the initial
  connect attempt (`REDIS_CONNECT_TIMEOUT_MS` + a capped
  `reconnectStrategy`) so a request fails fast with a 500 instead of
  hanging forever when Redis is unreachable
- `infra/events/event-publisher.ts` / `infra/kafka/producer.ts` — same
  `EventPublisher` interface and `KafkaEventPublisher` implementation as
  catalogue-service
- `infra/catalogue/catalogue-client.ts` — `CatalogueClient` interface
  (`getProduct`), so cart-service doesn't hardcode HTTP specifics beyond
  its one implementation
- `infra/catalogue/http-catalogue-client.ts` — `HttpCatalogueClient`: calls
  catalogue-service's `GET /products/:id` with a bounded timeout
  (`AbortController`), returning `null` on a real 404 (not found) vs.
  throwing on any other failure (5xx, network, timeout) — same "null means
  not found, throw means something's actually wrong" convention as the
  Mongo repositories
- `utils/http/currentUser.ts` — `requireUserId`: reads the `X-User-Id`
  header the API gateway is expected to forward after validating the
  caller's JWT; 401s if it's missing. No JWT validation happens here,
  same posture as catalogue-service
- `utils/http/asyncHandler.ts`, `utils/http/validate.ts`,
  `utils/di/types.ts`, `utils/di/container.ts` — same shape as
  catalogue-service's equivalents

## Dependency injection

`CartRepository`, `EventPublisher`, and `CatalogueClient` are interfaces
bound in `utils/di/container.ts`. Swapping Redis for something else, or
pointing `CatalogueClient` at a gRPC call instead of HTTP, means adding an
implementation and changing one binding — no changes to `CartService`.

## HTTP API

| Method | Path                    | Description |
| ------ | ----------------------- | ------------ |
| GET    | `/health`                | Liveness check |
| GET    | `/cart`                  | Get the caller's cart (empty cart if none exists — not a 404) |
| DELETE | `/cart`                  | Clear the caller's cart |
| POST   | `/cart/items`             | Add an item (validated body: `productId`, `quantity`); looks up the product in catalogue-service, 404s if it doesn't exist |
| PATCH  | `/cart/items/:productId`  | Set a line item's quantity |
| DELETE | `/cart/items/:productId`  | Remove a line item |
| GET    | `/openapi.yaml`           | The OpenAPI 3.0 spec for this API |

Every `/cart*` route requires an `X-User-Id` header (see `currentUser.ts`
above) — missing it is a `401`.

Run with `npm run dev` (or `npm run build && npm start`). Listens on
`PORT` (default `3001` — catalogue-service uses `3000`, so both can run
side by side).

## Price/name staleness — a deliberate tradeoff

`CartItem.name`/`unitPrice` are snapshotted from catalogue-service at
add-time and stored in Redis. `GET /cart` reads only from Redis — it never
calls catalogue-service — so viewing your cart is fast and doesn't break
if catalogue-service is briefly down. The cost: a price shown in the cart
can drift from the live product price between add-time and checkout.
There's no checkout flow yet to need it, but when one exists, it should
re-validate current price/availability against catalogue-service before
finalizing an order — don't trust the cart's snapshot for money math.

## Configuration

| Env var                       | Default                     |
| ------------------------------ | ---------------------------- |
| `PORT`                          | `3001`                       |
| `REDIS_URL`                     | `redis://localhost:6379`     |
| `REDIS_CONNECT_TIMEOUT_MS`      | `5000`                       |
| `REDIS_MAX_CONNECT_RETRIES`     | `3`                          |
| `CART_TTL_SECONDS`              | `2592000` (30 days)          |
| `KAFKA_BROKERS`                 | `localhost:9092`             |
| `KAFKA_CLIENT_ID`               | `cart-service`                |
| `CART_TOPIC`                    | `cart.events`                 |
| `CATALOGUE_SERVICE_URL`         | `http://localhost:3000`       |
| `CATALOGUE_REQUEST_TIMEOUT_MS`  | `5000`                        |

## Events published

- `CART_TOPIC` (default `cart.events`): `cart.item_added`,
  `cart.item_quantity_updated`, `cart.item_removed`, `cart.cleared` — cart
  activity is a strong signal for recommendation-service later (an item
  added to a cart is stronger intent than a page view).

## Auth

Same as catalogue-service: no JWT validation here. `requireUserId`
trusts `X-User-Id` because it assumes the API gateway already validated
the caller and set it — this service should never be reachable directly
from outside the cluster/network.

## Docker

Same multi-stage shape as catalogue-service's `Dockerfile`
(`development`/`build`/`production`). See the root `docker-compose.yml`
(not a per-service one — cart-service needs to reach catalogue-service
and share Kafka with it, so local dev now runs the whole stack together)
for how to run this alongside catalogue-service, Mongo, Kafka, and Redis.
