# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Build stage. Vite inlines every VITE_* value at build time, so the API URL
# and the demo flag are build args rather than runtime environment variables —
# a built bundle is pinned to whatever it was built with.
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Dependencies first, so a source-only change does not reinstall them.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8000/
ARG VITE_DEMO_MODE=false
ARG VITE_AI_PROXY_URL=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_DEMO_MODE=$VITE_DEMO_MODE \
    VITE_AI_PROXY_URL=$VITE_AI_PROXY_URL

# `npm run build` is `tsc && vite build`, so a type error fails the image.
RUN npm run build

# ---------------------------------------------------------------------------
# Runtime stage. nginx-unprivileged runs as uid 101 and listens on 8080, so
# nothing in the final image needs root and no build tooling ships with it.
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY --chown=101:101 docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

USER 101

EXPOSE 8080

# /healthz is a 200-returning location in nginx.conf; wget is in the base image.
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --spider --quiet http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
