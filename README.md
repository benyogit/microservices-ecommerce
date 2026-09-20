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

Each service documents its contracts two ways: `GET /openapi.yaml` for
its HTTP API, `GET /asyncapi.yaml` for the Kafka events it publishes —
both served live, so another service can discover either without reading
this repo's code.

## Local Kubernetes

[`k8s/`](k8s/README.md) — runs the stack on a local `kind` cluster behind
an `ingress-nginx` gateway. Free, local, spin up/down on demand.
