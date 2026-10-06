# microservices-ecommerce

## Services

- [`services/catalogue-service`](services/catalogue-service/README.md) — products and categories
- [`services/cart-service`](services/cart-service/README.md) — per-user shopping carts (Redis)

## Local development

```
docker compose up
```

Brings up the whole stack — Mongo, Kafka, Redis, `catalogue-service`, and
`cart-service` — wired together, with hot reload on both services. See
each service's README for its own env vars and API.

Both services pick their message broker via `EVENT_BUS` (`kafka` by
default, or `rabbitmq`) without any code change — see each service's
`infra/rabbitmq/producer.ts`. RabbitMQ itself isn't started by a plain
`docker compose up`; add it with `docker compose --profile rabbitmq up`
and set `EVENT_BUS=rabbitmq` on whichever service(s) should use it.

Each service documents its contracts two ways: `GET /openapi.yaml` for
its HTTP API, `GET /asyncapi.yaml` for the events it publishes — both
served live, so another service can discover either without reading
this repo's code.

## Local Kubernetes

[`k8s/`](k8s/README.md) — runs the stack on a local `kind` cluster behind
an `ingress-nginx` gateway. Free, local, spin up/down on demand.
