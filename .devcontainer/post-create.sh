#!/bin/bash
set -e

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Start postgres service from docker-compose
echo "Starting PostgreSQL container..."
docker-compose -f docker-compose.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U postgres >/dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo "PostgreSQL is ready."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Post-create command finished."
