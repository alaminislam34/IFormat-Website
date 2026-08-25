#!/bin/sh
set -e

echo "🚀 Starting iFormat Backend Container..."

# Automatically apply database migrations in production
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Synchronizing database schema with Prisma..."
  # If migrations folder exists, run migrate deploy, otherwise fallback to db push
  if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    npx prisma migrate deploy || echo "⚠️ Prisma migrate deploy encountered an issue, continuing..."
  else
    npx prisma db push --skip-generate || echo "⚠️ Prisma db push encountered an issue, continuing..."
  fi
fi

echo "✨ Database synchronization complete. Launching server..."
exec "$@"
