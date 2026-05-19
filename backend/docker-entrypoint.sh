#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "$RUN_PRISMA_PUSH" = "true" ]; then
  echo "[entrypoint] Applying Prisma schema (db push)..."
  npx prisma db push --skip-generate
fi

exec "$@"
