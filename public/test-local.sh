#!/bin/bash

# This script is for testing the Astra One site locally
# It SHOULD NOT be used in the Cloudflare Pages build process

echo "Installing Playwright and dependencies..."
npm install -D @playwright/test@latest
npx playwright install chromium --with-deps

echo "Running tests..."
# Add your test command here, e.g.
# npx playwright test

echo "Tests completed!"

echo "Remember: Don't run this script during deployment. It requires system permissions." 