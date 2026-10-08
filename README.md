# microservices-ecommerce

This is an npm workspaces monorepo: one root `package.json` installs
every service's and shared package's dependencies in one pass and
symlinks shared packages into the services that use them — no
publishing, no version bumps for local code.

## Services

- [`services/catalogue-service`](services/catalogue-service/README.md) — products and categories
- [`services/cart-service`](services/cart-service/README.md) — per-user shopping carts (Redis)

## Shared packages

- [`packages/event-bus`](packages/event-bus/README.md) — `EventPublisher`
  interface + its Kafka/RabbitMQ implementations, used by both services.
  The only code shared across services on purpose: rarely-changing infra,
  not domain logic. Everything else (Mongo, Redis, S3, the HTTP client
  between services) stays duplicated-by-design in each service's own
  `infra/`, since those genuinely differ per service.

## Local development

```
npm install
docker compose up
```

`docker compose up` brings up the whole stack — Mongo, Kafka, Redis,
`catalogue-service`, and `cart-service` — wired together, with hot reload
on both services' own code. `packages/event-bus` is baked into each
image at build time rather than bind-mounted, since it's meant to change
rarely — editing it needs `docker compose build <service>`, not just a
save (or `npm run build --workspace=packages/event-bus` plus a restart,
for non-Docker local dev). See each service's README for its own env
vars and API, and `packages/event-bus`'s README for more on that
tradeoff.

Both services pick their message broker via `EVENT_BUS` (`kafka` by
default, or `rabbitmq`) without any code change — see
`packages/event-bus/src/`. RabbitMQ itself isn't started by a plain
`docker compose up`; add it with `docker compose --profile rabbitmq up`
and set `EVENT_BUS=rabbitmq` on whichever service(s) should use it.

Each service documents its contracts two ways: `GET /openapi.yaml` for
its HTTP API, `GET /asyncapi.yaml` for the events it publishes — both
served live, so another service can discover either without reading
this repo's code.

## Local Kubernetes

[`k8s/`](k8s/README.md) — runs the stack on a local `kind` cluster behind
an `ingress-nginx` gateway. Free, local, spin up/down on demand.
