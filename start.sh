#!/bin/bash
# Install dependencies
npm ci

# Build the application
npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Start the production server
NODE_ENV=production node dist/index.js
