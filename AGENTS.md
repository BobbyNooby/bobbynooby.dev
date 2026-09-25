# AGENTS.md

## What this is

**bobbynooby.dev** is BobbyNooby's personal site: a terminal-styled single-page portfolio
with live widgets (Discord status, Spotify now-playing, Twitch live, site chat, visitor
count), a 3x3 media grid (anime/manga/games via AniList), a URL shortener, and an admin
customization UI.

It is a **Bun-workspaces monorepo** with three workspaces:

- **`apps/web`** — the SvelteKit site (formerly this repo's root; legacy GitHub repo:
  `BobbyNooby/bobbynooby.dev`)
- **`apps/backend`** — Bun + Express + `ws` WebSocket server, port 3001 (squashed
  subtree of the former `BobbyNooby/bobbynooby.dev.backend` repo — its history
  collapsed to one merge commit; the original repo remains as archive)
- **`packages/shared`** — payload types + zod schemas shared by both apps. **Rule: pure
  types/zod only — no `$env`, no Svelte runes, no DB imports.**

The live widgets are powered by `apps/backend`:

- **Backend modules** (`apps/backend/modules/`): `discord` (Discord bot presence relayed
  over WS), `spotify` (now-playing / last-played with token refresh), `userCount`,
  `chat` (simple chat persisted to Mongo, mirrored to a Discord log channel), `mongodb`
  (dual clients: Atlas + VPS)
- **Coupling:** frontend and backend share the Discord OAuth session via an
  httpOnly cookie scoped to `.bobbynooby.dev` (see `sameSite: none; domain` config in
  both `apps/web/src/auth.ts` and `apps/backend/auth.ts`). WebSocket subroutes: `/discord`,
  `/userCount`, `/spotify`, `/chat`.

## Stack

- **Web:** SvelteKit 2 + Svelte 5 (**runes**: `$state`, `$props`, `$derived` —
  `.svelte.ts` files are reactive modules, e.g.
  `apps/web/src/lib/admin/orderedTable.svelte.ts`), TypeScript, Vite 6, Tailwind CSS 4
  (via `@tailwindcss/vite` plugin, no config file), Auth.js (`@auth/sveltekit`) with
  Discord provider (`identify` scope only), MongoDB driver, adapter-node deployment
- **Backend:** Bun + Express + `ws`, `@auth/express` sharing the web session
- **Shared:** zod schemas (`chatIntakeSchema`) + payload types, token bucket
- **Tooling:** single root lockfile (`bun.lock`), Vitest at the root (node environment;
  `packages/**` tests) and in `apps/web` (tests colocated as `src/**/*.test.ts`),
  ESLint 9 flat config + Prettier (web)

## Commands

```bash
bun install            # from the repo root (single lockfile, hoisted node_modules)
bun run dev            # both dev servers (bun --filter; output prefixed per workspace)
bun run dev:web        # vite dev server (localhost:5173)
bun run dev:backend    # backend server (port 3001)
bun run build          # web production build (adapter-node -> apps/web/build/)
bun run check          # svelte-kit sync + svelte-check (typecheck)
bun run lint           # prettier --check . && eslint . (in apps/web)
bun run format         # prettier --write . (in apps/web)
bun run test           # web vitest suite, then root vitest (packages/**)
docker compose up      # full stack: web on 3000 + backend on 3001
```

Run `bun run check`, `bun run lint`, and `bun run test` after changes. Per-app `.env`
files with real credentials are required for dev (`apps/web/.env`,
`apps/backend/.env`) — see below. NEVER commit or echo them.

## Architecture notes

- **Workspace layout:** everything below lives in its workspace; root has only
  `package.json`, `bun.lock`, `vitest.config.ts`, `docker-compose.yml`, `.dockerignore`,
  and docs.
- **Web routes** (`apps/web/src/routes/`):
  - `/` — the main page; server load fetches links + projects from Mongo
  - `/3x3` and `/3x3/[category]` — media grids backed by AniList + Mongo cache;
    unknown categories 404 (validated against `3x3_dynamic_routes` before any
    collection read)
  - `/shorten` — URL shortener UI; `/[shortURL]` — redirect handler
  - `/customize` — admin-only editor for links/projects/3x3 (guarded in
    `+page.server.ts` via `locals.isAdmin`)
  - `/api/*` — JSON endpoints: `discord/status`, `spotify/now_playing`,
    `spotify/last_played`, `twitch/live`, `steam/games`, `steam/game/[appid]`, `links`,
    `projects` (the three discord/spotify routes send CORS headers restricted to site
    origins; all `/api/*` GETs are rate-limited per client IP in production;
    `discord/status` redacts internal errors; the steam routes are Mongo-cached with
    6h/24h TTLs and stale-serve, no CORS — first-party only)
  - `/signin`, `/signout` — Auth.js entry points
- **Auth & permissions:** `hooks.server.ts` resolves the session once per request into
  `locals.isAdmin` / `locals.canShorten` (typed in `apps/web/src/app.d.ts`) by looking
  up the user's Discord ID in the Mongo `admin_ids` collection. **Fails closed.** In
  dev mode both are force-`true` (OAuth round-trip is unreliable locally); `dev` is
  baked in at build time, so this never ships to production.
- **Secrets are runtime-only:** server code imports `$env/dynamic/private` (never
  `$env/static/private` — that variant inlines values into the build output). Mongo
  connects lazily (`getMongoClient()`); `hooks.server.ts` defers the first connect to
  the first request so builds need no env.
- **WebSockets:** client widgets use `createLiveSocket()`
  (`apps/web/src/lib/utils/liveSocket.ts`) against `PUBLIC_WEBSOCKET_BASE_URL`; it
  reconnects with exponential backoff (max 30s) and is a no-op stub during SSR. Prefer
  it over bare `new WebSocket(...)`. Chat messages are validated with
  `chatIntakeSchema` from `packages/shared`; authed users' display names are pinned to
  their Discord identity; per-identity token buckets rate-limit messages.
- **Mongo:** a single client is created lazily in
  `apps/web/src/lib/db/mongo.ts`. Collections include `projects`, `links`,
  `admin_ids`, `threex3`-related and AniList cache collections (see `mongoUtils.ts` /
  `mongoTypes.ts`).
- **scripts/:** one-off scripts run directly (e.g. `apps/web/scripts/add-project.ts`
  idempotently upserts a project into Mongo by reading `apps/web/.env`).

## Environment variables

A single root `.env` (git-ignored, **never commit or echo it**) feeds both apps in
development: `apps/web/.env` is a relative symlink to it (`ln -s ../../.env
apps/web/.env` after cloning — SvelteKit and Vite only read env from the project dir;
SvelteKit ignores Vite's `envDir` for `$env/static/*`), the backend's `env.ts` loads it
via `dotenv` and is imported first in `main.ts` (backend modules fail fast on missing
keys at import time), the one-off scripts read `../../.env` directly, and
`docker-compose.yml` passes it to both containers (`env_file`, optional). In production
the Coolify resource-level env supersedes it.

Root `.env` keys: `AUTH_SECRET` (one shared value — the Discord session cookie is
shared between web and backend), `IS_PRODUCTION` (keep `false` for dev), `WSS_PORT`
(3001), `MONGO_ADMIN_URL`, `MONGO_ATLAS_URL`, `MONGO_VPS_URL`,
`PRODUCTION_CHAT_COLLECTION`, `DEV_CHAT_COLLECTION`, `DISCORD_CLIENT_ID`,
`DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_USER_ID`,
`DISCORD_CHATLOG_CHANNEL`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`,
`SPOTIFY_CLIENT_REFRESH_TOKEN`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`,
`STEAM_API_KEY`, `STEAM_USER_ID` (steamid64; the steam features degrade to
`configured:false` without them), `PUBLIC_WEBSOCKET_BASE_URL`

## Style

- **Web + shared** — Prettier is law: **tabs**, single quotes, no trailing commas, 100
  print width, svelte + tailwind class-sorting plugins (`apps/web/.prettierrc`).
- **Backend** — a different style (2 spaces, double quotes, semicolons, no formatter).
  Don't cross-apply styles between workspaces.
- No comments unless they explain a non-obvious decision; existing comments in the
  codebase follow that pattern.

## Commit conventions

Follow Conventional Commits, as recent history does:

```
feat: twitch live box in left column
fix: websocket clients reconnect with backoff
refactor: replace admin stores with Svelte 5 $state OrderedTable
chore: add zod and vitest dependencies
test: add vitest coverage for the ordered-table stores
```

- Types in use: `feat`, `fix`, `refactor`, `style`, `chore`, `test`
- Lowercase, imperative mood, concise one-line summary; optional parenthetical note
  after the summary. No AI attribution footers.
- Default branch is **`master`** (not `main`). Remote:
  `git@github.com:BobbyNooby/bobbynooby.dev.git`. `origin/svelte4` is a legacy branch.

## Deployment

One `docker-compose.yml` at the repo root builds both images (`oven/bun:1`) and deploys
with **Coolify as a single compose resource** — the web app serves on 3000, the backend
on 3001, so both sides always deploy together (no version skew). Dockerfiles COPY from
the repo root (including `packages/shared`) and build from there. Env vars are set at
the Coolify resource level and land in the containers' env — **except
`PUBLIC_WEBSOCKET_BASE_URL`, which must also be present at build time** (a Coolify
build arg): it is baked into the client bundle via `$env/static/public` and setting it
only at runtime leaves the widgets pointing at an empty host. `IS_PRODUCTION` flows
through the compose file (`${IS_PRODUCTION:-false}`), so set it `true` at the resource
level for production. `svelte.config.js` uses
`@sveltejs/adapter-node` (the `adapter-vercel` dep is installed but unused — don't
switch adapters without good reason).
