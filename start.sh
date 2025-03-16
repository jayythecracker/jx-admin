#!/bin/bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start the production server
NODE_ENV=production node dist/index.js