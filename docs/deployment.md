# ProofCast Deployment Guide

This guide is the release checklist for the hackathon build. ProofCast is live-only: it must never claim Tatum, Walrus, DeepSeek, Postgres, Redis, or Sui anchor success unless the real service confirms it.

## 1. Preflight Locally

Run this from the repository root before deploying:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm deploy:check
```

The preflight validates env configuration, linting, TypeScript, unit tests, Prisma schema, Next production build, and the ProofCast Move package build.

## 2. Railway Infrastructure

Create two Railway services:

- PostgreSQL
- Redis

Copy the production database URLs into Vercel:

- `DATABASE_URL`: pooled/runtime Postgres URL
- `DIRECT_URL`: direct Postgres URL for Prisma migrations
- `REDIS_URL`: Railway Redis URL

After the first deploy, run the database migrations once:

```bash
corepack pnpm prisma:deploy
```

If you run migrations from your laptop, point `DATABASE_URL` and `DIRECT_URL` at the Railway Postgres instance first.

## 3. Vercel Web App

Deploy `apps/web` as the Vercel application.

Recommended Vercel settings:

- Framework: Next.js
- Root Directory: `apps/web`
- Install Command: `corepack pnpm install --frozen-lockfile`
- Build Command: `corepack pnpm build`
- Output Directory: leave blank for Next.js

Set these Vercel environment variables for Production and Preview:

```bash
DATABASE_URL=
DIRECT_URL=
REDIS_URL=
TATUM_API_KEY=
TATUM_SUI_NETWORK=testnet
TATUM_SUI_RPC_URL=https://sui-testnet.gateway.tatum.io
WALRUS_NETWORK=testnet
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
NEXT_PUBLIC_APP_URL=https://YOUR-VERCEL-DOMAIN
SUI_PROOFCAST_PACKAGE_ID=
```

`SUI_PROOFCAST_PACKAGE_ID` is optional until the registry package is published. Without it, ProofCast still captures, stores, verifies, replays, and shares Walrus-backed snapshots, but wallet-signed Sui anchors stay disabled.

## 4. Sui Registry Package

Build locally:

```bash
corepack pnpm move:build
```

Publish from `contracts/sui/proofcast_registry`, then set `SUI_PROOFCAST_PACKAGE_ID` to the published package ID in Vercel.

## 5. Post-Deploy Smoke Test

After Vercel deploys, open:

```text
https://YOUR-VERCEL-DOMAIN/api/health
```

Expected:

- `ok: true`
- Tatum configured
- Walrus configured
- DeepSeek configured
- Postgres configured
- Redis configured

Then test the product:

1. Open `/dashboard`.
2. Click Load Demo.
3. Capture a live ProofCast.
4. Open the public ProofCast link.
5. Open Replay Mode.
6. Generate a Chain Memory.
7. Open `/mcp` and show judges that ProofCast uses official Tatum MCP only.

## 6. Submission Links

Prepare these links for judges:

- Live app: `https://YOUR-VERCEL-DOMAIN`
- Project explainer: `https://YOUR-VERCEL-DOMAIN/project`
- Tatum MCP guide: `https://YOUR-VERCEL-DOMAIN/mcp`
- Public proof example: `https://YOUR-VERCEL-DOMAIN/proofcast/662c368e`
- Demo video
- GitHub repository
