# bobbynooby.dev

BobbyNooby's personal site — a terminal-styled single-page portfolio with live widgets
(Discord status, Spotify now-playing, Twitch live, site chat, visitor count), a 3x3
media grid, a URL shortener, and an admin customization UI.

## Layout

A Bun-workspaces monorepo:

| Workspace          | What it is                                                        |
| ------------------ | ----------------------------------------------------------------- |
| `apps/web`         | SvelteKit 2 + Svelte 5 site (adapter-node)                         |
| `apps/backend`     | Bun + Express + `ws` WebSocket server, port 3001                   |
| `packages/shared`  | Shared payload types + zod schemas (pure, no env/DB imports)       |

## Quickstart

```bash
bun install

# one root env file with real credentials (never committed):
#   .env               — Mongo, Discord OAuth, Spotify, Twitch, WSS_PORT,
#                        PUBLIC_WEBSOCKET_BASE_URL
# after creating it, link it into the web app (SvelteKit reads env
# from the project dir only):
#   ln -s ../../.env apps/web/.env

bun run dev:web      # http://localhost:5173
bun run dev:backend  # ws://localhost:3001
```

## Useful commands

```bash
bun run build   # web production build
bun run check   # typecheck (svelte-check)
bun run lint    # prettier + eslint (web)
bun run test    # web vitest, then packages/shared vitest
docker compose up --build   # full stack: web on 3000, backend on 3001
```

## Deployment

One `docker-compose.yml` builds both images; Coolify deploys them as a single compose
resource so web (3000) and backend (3001) always ship together. Env vars are set at the
Coolify resource level — except `PUBLIC_WEBSOCKET_BASE_URL`, which must also be passed
as a **build arg** (it is baked into the client bundle at build time), and
`IS_PRODUCTION=true` for production (flows through the compose file). See `AGENTS.md`
for architecture details.
