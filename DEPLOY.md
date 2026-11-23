# Deploy — Krillion Unblocked (daily-games hub)

Next.js 16 + React 19 + Tailwind 4 + shadcn/ui + Prisma (SQLite).
Seven games: Krillion (daily + Unlimited), Noillirk, Krillion City, Word Hunt,
What's Your Guess?, Colour Memory, Sequence — plus Stories, FAQ,
How to Play, About, Contact and legal pages. No sign-in, no paywall.

## Run locally

```bash
bun install
bun run dev        # http://localhost:3000
```

`bun` is preferred (`bun.lock` is committed); `npm install` / `npm run dev`
work too. Node 20+ is required.

## Environment

| Variable | Required? | Value |
|---|---|---|
| `DATABASE_URL` | No — the Prisma client is bundled but no page or API route queries the database at runtime yet | `file:./db/custom.db` (already set in `.env.local` for local runs; the SQLite file ships in `db/`) |

No secrets, API keys or third-party accounts are needed.

## Production build (verified 2026-11-12)

```bash
bun run build
```

This runs `next build` and then copies `.next/static` and `public/` into
`.next/standalone/`, so the standalone folder is self-contained.
25 pages prerender (all routes static except `/api`, which is dynamic).

> **Note for restricted networks:** `next build` downloads the Google Fonts
> (Crimson Text, Press Start 2P, Silkscreen, Space Mono) at build time.
> If the build fails with a Turbopack TLS error while fetching fonts,
> retry with:
>
> ```bash
> NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 bun run build
> ```
>
> On Vercel and normal networks the plain build works.

## Option A — Vercel (recommended)

1. Push this folder to a Git repo and import it in Vercel.
2. Framework preset: **Next.js**. Install command: `bun install`
   (or leave default `npm install`). Build command: `bun run build`.
3. Environment variable (optional): `DATABASE_URL=file:./db/custom.db`.
4. Add the domain `krillionunblocked.com` in Vercel → Domains.

## Option B — Standalone VPS (bun or node)

1. On the server: `bun install --production` is **not** needed — the
   standalone output carries its own `node_modules`.
2. Build once (locally or on the server): `bun run build`.
3. Copy `.next/standalone/` to the server (it already contains
   `server.js`, `.next/static/` and `public/`).
4. Run it:

```bash
cd standalone
NODE_ENV=production PORT=3000 bun server.js
# or: NODE_ENV=production PORT=3000 node server.js
```

5. Put it behind a reverse proxy for HTTPS (nginx/Caddy) and keep it
   alive with `systemd` or `pm2`. Example systemd unit:

```ini
[Unit]
Description=Krillion Unblocked
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/krillion/standalone
ExecStart=/usr/local/bin/bun server.js
Environment=NODE_ENV=production PORT=3000
Restart=always

[Install]
WantedBy=multi-user.target
```

## Smoke check after deploy

Every route below must return **200**:

`/`, `/krillion-unblocked`, `/unlimited`, `/noillirk`, `/word-hunt`,
`/sequence`, `/colour-memory`, `/whats-your-guess`, `/stories`,
`/stories/how-to-play-krillion-unblocked`, `/faq`, `/how-to-play`,
`/about`, `/contact`, `/terms`, `/privacy-policy`, `/disclaimer`,
`/robots.txt`, `/sitemap.xml`.

Quick check:

```bash
for p in / /krillion-unblocked /noillirk /word-hunt /stories /robots.txt; do
  curl -s -o /dev/null -w "$p -> %{http_code}\n" "https://krillionunblocked.com$p"
done
```
