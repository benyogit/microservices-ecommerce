# Local Kubernetes

Runs `catalogue-service` and `cart-service` (+ Mongo, Kafka, Redis) on a
local [kind](https://kind.sigs.k8s.io/) cluster, fronted by an
[ingress-nginx](https://kubernetes.github.io/ingress-nginx/) Ingress
acting as the API gateway. Entirely free and local — nothing here talks
to a cloud provider. Spin the cluster up when you want to demo it, delete
it when you're done (see Teardown).

Kubernetes itself has no built-in API gateway — `Ingress` is just a
routing spec (host/path -> Service). `ingress-nginx` is the piece that
actually reads it and does the routing, which is why it's installed
separately below rather than being part of "Kubernetes" itself.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

## 1. Create the cluster

```
kind create cluster --config k8s/kind-config.yaml
```

`kind-config.yaml` maps host ports 80/443 into the cluster and labels the
node `ingress-ready`, per kind's own
[Ingress guide](https://kind.sigs.k8s.io/docs/user/ingress/).

## 2. Install ingress-nginx

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

(That URL is kind's official ingress-nginx manifest for local clusters — check
[kind's Ingress docs](https://kind.sigs.k8s.io/docs/user/ingress/) if it's moved.)

## 3. Build and load the service images

`kind` doesn't pull from a registry — each image has to be loaded
directly into the cluster's nodes:

```
docker build --target production -t catalogue-service:local services/catalogue-service
docker build --target production -t cart-service:local services/cart-service
kind load docker-image catalogue-service:local
kind load docker-image cart-service:local
```

Re-run both build+load steps for a service after any code change in it —
there's no hot reload here, unlike `docker-compose.yml` (this setup
mirrors a production deploy, not local dev).

## 4. Apply the manifests

```
kubectl apply -f k8s/
```

(Numbered filenames so this single command works — the namespace lands
first, everything else can retry against it. To apply one service's
manifest on its own instead: `kubectl apply -f k8s/00-namespace.yaml -f k8s/35-cart-service.yaml`
etc.)

Watch it come up:

```
kubectl get pods -n catalogue -w
```

Both services run 2 replicas here on purpose — the Ingress load balances
across both pods of whichever service you hit, which is the actual reason
to route through a gateway instead of hitting a pod directly.

## 5. Try it

```
curl http://localhost/catalogue/health
curl http://localhost/catalogue/products
curl -H "X-User-Id: demo-user" http://localhost/cart
```

The Ingress strips the `/catalogue` or `/cart` prefix before forwarding,
so these reach each service's own `/health`/`/products`/`/cart` routes
unchanged. `cart-service` requires `X-User-Id` on `/cart*` (see its
README) — the gateway doesn't set this for you here since there's no real
auth/JWT layer in this local setup, just the header cart-service expects.

## Teardown

```
kind delete cluster --name catalogue
```

Deletes everything — no lingering cost, nothing left running. Recreate
from step 1 whenever you want to demo it again.
