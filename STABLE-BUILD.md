# Astra One Stable Build

This file documents the current stable build configuration for Astra One that has been verified working with Cloudflare Pages deployment.

## Current Stable Version

- **Tagged Version**: `v1.0.1-stable`
- **Date Created**: May 20, 2025
- **Status**: Verified working with Cloudflare Pages

## Key Features

- Static Astro site using `output: "static"`
- No adapter needed for static builds
- Mermaid diagrams using `pre-mermaid` strategy
- Image optimization with Sharp
- Simple deployment script and configuration

## How to Use This Checkpoint

If you need to revert to this stable configuration:

```bash
# Check out specific files from the stable tag
git checkout v1.0.1-stable -- astro.config.mjs cloudflare-pages.config.json package.json wrangler.json

# Or revert the entire repository to this tag
git checkout v1.0.1-stable
```

## Where to Find Detailed Documentation

Detailed documentation about the stable configuration can be found in:

1. `.cursor/rules/stable-build.mdc` - Cursor rule for stable build configuration
2. `.cursor/rules/cloudflare-deployment.mdc` - Cursor rule for Cloudflare deployment guidelines
3. `docs/deployment.md` - General deployment documentation
4. `docs/cloudflare-deployment-rules.md` - Detailed Cloudflare deployment rules

## Critical Configuration Notes

- Always use `output: "static"` without an adapter
- Use the `pre-mermaid` strategy for Mermaid diagrams
- Use the Sharp service for image optimization
- Keep the deployment script simple: `"deploy": "astro build"`
- Ensure all required dependencies are in the `dependencies` section, not `devDependencies`
- **Keep the wrangler.json file** - Required for Cloudflare Pages deployment even with static builds

## Testing Before Deployment

Before deploying, always:

1. Run `npm run check` to verify the build process
2. Run `npm run build` to ensure local builds work
3. Test locally with `npm run preview`
4. Keep testing logic separate from the deployment process

---

This stable build reference was created to help maintain a working configuration for the project. Always check this document when making significant changes to the build configuration. 