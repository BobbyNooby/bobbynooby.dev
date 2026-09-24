# AGENTS.md

## What this is

**bobbynooby.dev** is BobbyNooby's personal site: a terminal-styled single-page portfolio
with live widgets (Discord status, Spotify now-playing, Twitch live, site chat, visitor
count), a 3x3 media grid (anime/manga/games via AniList), a URL shortener, and an admin
customization UI.

It is only half of the system. The live widgets are powered by a companion backend repo:

- **Backend repo:** `/Users/bobong/Repositories/bobbynooby.dev.backend`
  (GitHub: `BobbyNooby/bobbynooby.dev.backend`)
- **Backend stack:** Bun + Express + `ws` WebSocket server, port 3001
- **Backend modules** (`modules/`): `discord` (Discord bot presence relayed over WS),
  `spotify` (now-playing / last-played with token refresh), `userCount`, `chat`
  (simple chat persisted to Mongo, mirrored to a Discord log channel), `mongodb`
  (dual clients: Atlas + VPS)
- **Coupling:** frontend and backend share the Discord OAuth session via an
  httpOnly cookie scoped to `.bobbynooby.dev` (see `sameSite: none; domain` config in
  both `src/auth.ts` and backend `auth.ts`). WebSocket subroutes: `/discord`,
  `/userCount`, `/spotify`, `/chat`.

## Stack (this repo)

- SvelteKit 2 + Svelte 5 (**runes**: `$state`, `$props`, `$derived` — `.svelte.ts` files
  are reactive modules, e.g. `src/lib/admin/orderedTable.svelte.ts`)
- TypeScript, Vite 6, Tailwind CSS 4 (via `@tailwindcss/vite` plugin, no config file)
- Auth.js (`@auth/sveltekit`) with Discord provider (`identify` scope only)
- MongoDB driver (`src/lib/db/mongo.ts`), adapter-node deployment, Docker (bun image)
- Vitest (node environment), ESLint 9 flat config + Prettier
- Other integrations in `src/lib/`: `spotify`, `twitch`, `anilist`, `media` (AniList
  cache), `shortURL`, `discord` (types/utils)

## Commands

```bash
npm run dev       # vite dev server (localhost:5173)
npm run build     # production build (adapter-node -> build/)
npm run check     # svelte-kit sync + svelte-check (typecheck)
npm run lint      # prettier --check . && eslint .
npm run format    # prettier --write .
npm run test      # vitest run (tests colocated as src/**/*.test.ts)
```

Run `npm run check`, `npm run lint`, and `npm run test` after changes. A `.env` file with
real credentials is required for dev (Mongo, Discord OAuth, etc.) — see below.

## Architecture notes

- **Routes** (`src/routes/`):
  - `/` — the main page; server load fetches links + projects from Mongo
  - `/3x3` and `/3x3/[category]` — media grids backed by AniList + Mongo cache
  - `/shorten` — URL shortener UI; `/[shortURL]` — redirect handler
  - `/customize` — admin-only editor for links/projects/3x3 (guarded in
    `+page.server.ts` via `locals.isAdmin`)
  - `/api/*` — JSON endpoints: `discord/status`, `spotify/now_playing`,
    `spotify/last_played`, `twitch/live`, `links`, `projects`
  - `/signin`, `/signout` — Auth.js entry points
- **Auth & permissions:** `hooks.server.ts` resolves the session once per request into
  `locals.isAdmin` / `locals.canShorten` (typed in `src/app.d.ts`) by looking up the
  user's Discord ID in the Mongo `admin_ids` collection. **Fails closed.** In dev mode
  both are force-`true` (OAuth round-trip is unreliable locally); `dev` is baked in at
  build time, so this never ships to production.
- **WebSockets:** client widgets use `createLiveSocket()` (`src/lib/utils/liveSocket.ts`)
  against `PUBLIC_WEBSOCKET_BASE_URL`; it reconnects with exponential backoff (max 30s)
  and is a no-op stub during SSR. Prefer it over bare `new WebSocket(...)`.
- **Mongo:** a single client is created at module load and connected in
  `hooks.server.ts`. Collections include `projects`, `links`, `admin_ids`,
  `threex3`-related and AniList cache collections (see `mongoUtils.ts` / `mongoTypes.ts`).
- **scripts/:** one-off Node scripts run directly (e.g. `scripts/add-project.ts`
  idempotently upserts a project into Mongo by reading `.env`).

## Environment variables

A real `.env` is present locally and **must never be committed or echoed**. Keys in use:

`AUTH_SECRET`, `IS_PRODUCTION`, `MONGO_ADMIN_URL`,
`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN`,
`DISCORD_GUILD_ID`, `DISCORD_USER_ID`, `DISCORD_CHATLOG_CHANNEL`,
`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_CLIENT_REFRESH_TOKEN`,
`TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `GENERAL_AUTH_KEY`,
`PUBLIC_WEBSOCKET_BASE_URL`

The backend additionally uses `WSS_PORT`, `MONGO_ATLAS_URL`, `MONGO_VPS_URL`,
`PRODUCTION_CHAT_COLLECTION`, `DEV_CHAT_COLLECTION`.

## Style

- Prettier is law in this repo: **tabs**, single quotes, no trailing commas, 100 print
  width, svelte + tailwind class-sorting plugins (`.prettierrc`).
- The backend repo uses a different style (2 spaces, double quotes, semicolons,
  no formatter). Don't cross-apply styles between repos.
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
  The backend repo also uses `master`.

## Deployment

Both repos ship as Docker images built on `oven/bun:1` and are deployed with **Coolify**
(see the Dockerfiles in each repo). The site serves on port 3000, the backend on 3001.
`svelte.config.js` uses `@sveltejs/adapter-node` (the `adapter-vercel` dep is installed
but unused — don't switch adapters without good reason).
