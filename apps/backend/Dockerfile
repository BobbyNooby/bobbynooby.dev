FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/
COPY apps/backend apps/backend/
COPY packages/shared packages/shared/
RUN bun install --frozen-lockfile --production

EXPOSE 3001

ENV NODE_ENV=production

CMD ["bun", "apps/backend/main.ts"]
