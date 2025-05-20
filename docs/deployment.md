# Deployment Guide for Astra One

## Cloudflare Pages Deployment

This project is configured for deployment on Cloudflare Pages, which offers hosting for static sites built with Astro.

### Configuration Files

The deployment is managed through two key files:

1. **cloudflare-pages.config.json**: Contains the build configuration for Cloudflare Pages.
   ```json
   {
       "build": {
           "command": "npm run deploy",
           "output_directory": "dist",
           "root_directory": ""
       }
   }
   ```

2. **package.json**: Contains the script commands, including the `deploy` script:
   ```json
   "scripts": {
     "deploy": "astro build"
   }
   ```

### Important Notes

- The site is configured to use static output mode in `astro.config.mjs` with `output: "static"` and no adapter.
- Mermaid diagrams are rendered using the `rehype-mermaid` plugin with `strategy: "pre-mermaid"`.
- Image optimization uses the `sharp` service locally, which will use an appropriate fallback on Cloudflare.

### Deployment Process

1. When code is pushed to the main branch, Cloudflare Pages automatically:
   - Clones the repository
   - Installs dependencies with `npm clean-install`
   - Runs the build command: `npm run deploy`
   - Deploys the contents of the `dist` directory

### Local Testing

Before deploying:

1. Run `npm run check` to verify the build process
2. Run `npm run preview` to test the site locally with Wrangler

### Running Tests

For running Playwright tests locally (not during deployment):

```bash
./public/test-local.sh
```

This script:
- Installs the latest Playwright test package
- Installs the Chromium browser
- Runs the Playwright tests

### Troubleshooting

If the build fails on Cloudflare:

1. Check the build logs for specific errors
2. Ensure all dependencies are correctly specified in package.json
3. Verify the `deploy` script doesn't include commands that require elevated permissions
4. Make sure the site is configured for static output, not server-side rendering

Remember that Cloudflare Pages build environment has limited permissions and cannot run commands that require sudo or root access. 