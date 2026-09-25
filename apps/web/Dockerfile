FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock* ./
COPY apps/web/package.json apps/web/
COPY apps/web apps/web/

# Baked into the client bundle at build time; real value comes via Coolify
# build args (server env is read at runtime via $env/dynamic/private).
ARG PUBLIC_WEBSOCKET_BASE_URL=

RUN bun install --frozen-lockfile

RUN cd apps/web && bun run build

FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
COPY --from=builder /app/apps/web/build apps/web/build
COPY --from=builder /app/node_modules node_modules/
# bun's isolated installer links direct deps from here into node_modules/.bun
COPY --from=builder /app/apps/web/node_modules apps/web/node_modules
COPY --from=builder /app/apps/web/package.json apps/web/package.json

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "apps/web/build/index.js"]
