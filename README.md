# microservices-ecommerce

Top-level layout — one concern per folder:

- **`services/`** — all application code and its local orchestration: the
  services themselves, the shared `packages/` they depend on, and
  `docker-compose.yml` for running the whole stack locally
- **`k8s/`** — Kubernetes manifests for running the stack on a local
  `kind` cluster
- **`terraform/`** — cloud infrastructure provisioning (not yet added)

See [`services/README.md`](services/README.md) for the services
themselves, local dev setup, and the npm workspaces layout.

## Local Kubernetes

[`k8s/`](k8s/README.md) — runs the stack on a local `kind` cluster behind
an `ingress-nginx` gateway. Free, local, spin up/down on demand.
