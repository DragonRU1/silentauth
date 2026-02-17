#!/bin/sh
set -e

echo "Running Prisma migrations..."
cd /app/packages/database
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init --skip-generate

echo "Generating Prisma client for backend..."
cd /app/packages/backend
cp /app/packages/database/prisma/schema.prisma ./schema.prisma
npx prisma generate --schema=./schema.prisma

echo "Starting backend server..."
npx tsx watch src/index.ts
