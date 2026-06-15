#!/usr/bin/env bash
# Vercel build entrypoint for Riad Dar Kader.
# - verifies DATABASE_URL is present
# - syncs the Prisma schema using Neon's DIRECT (unpooled) host
# - seeds idempotently (non-fatal)
# - builds Next.js (which uses the pooled DATABASE_URL at runtime)
set -e

# Ensure local CLI binaries (prisma, tsx, next) resolve in any shell.
export PATH="$PWD/node_modules/.bin:$PATH"

if [ -z "$DATABASE_URL" ]; then
  echo "------------------------------------------------------------------"
  echo "ERROR: DATABASE_URL is not set in this build's environment."
  echo "Add it in Vercel → Project → Settings → Environment Variables"
  echo "(Production), then redeploy. See README for the full variable list."
  echo "------------------------------------------------------------------"
  exit 1
fi

# Neon's direct (unpooled) host is the pooled host without '-pooler'.
# Use DIRECT_DATABASE_URL if provided, otherwise derive it.
if [ -n "$DIRECT_DATABASE_URL" ]; then
  MIGRATE_URL="$DIRECT_DATABASE_URL"
else
  MIGRATE_URL="$(printf '%s' "$DATABASE_URL" | sed 's/-pooler//')"
fi

prisma generate

echo "→ Syncing database schema (prisma db push)…"
DATABASE_URL="$MIGRATE_URL" prisma db push --skip-generate --accept-data-loss

echo "→ Seeding database…"
tsx prisma/seed.ts || echo "seed step skipped (non-fatal)"

echo "→ Building Next.js…"
next build
