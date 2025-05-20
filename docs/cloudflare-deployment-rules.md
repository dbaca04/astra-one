# Cloudflare Pages Deployment Guidelines

## Configuration Requirements

- **Static Output Mode**
  - Always use `output: "static"` in astro.config.mjs
  - Use the Cloudflare adapter: `adapter: cloudflare()`
  - Avoid server-side rendering features as they require Workers mode
  
  ```typescript
  // ✅ DO: Use static output mode
  export default defineConfig({
    output: "static",
    adapter: cloudflare(),
  });

  // ❌ DON'T: Use SSR mode
  export default defineConfig({
    output: "server",
    adapter: cloudflare({ mode: "directory" }),
  });
  ```

- **Deploy Script Requirements**
  - Avoid installing browsers or using system commands in deploy scripts
  - No `sudo`, no browser installations
  - Keep deploy scripts simple: `"deploy": "astro build"`
  - Run tests locally, not during deployment

- **Cloudflare Pages Configuration**
  - Keep build commands simple in cloudflare-pages.config.json
  - Recommended configuration:
  
  ```json
  {
    "build": {
      "command": "npm run deploy",
      "output_directory": "dist",
      "root_directory": ""
    }
  }
  ```

- **Dependencies Management**
  - Ensure all production dependencies are in the `dependencies` section
  - Keep testing tools in `devDependencies`
  - Don't install dev dependencies during the build process

## Astro Components

- **Mermaid Diagrams**
  - Use the `"img-svg"` strategy for pre-rendering at build time
  - This strategy creates SVGs during the build process, not at runtime
  
  ```typescript
  markdown: {
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: "img-svg", 
        mermaidConfig: {
          theme: "default"
        }
      }]
    ],
  },
  ```

- **Image Optimization**
  - Use the compile service for Cloudflare compatibility
  
  ```typescript
  image: {
    service: { entrypoint: "astro/assets/services/compile" },
  },
  ```

## Testing Workflow

1. **Local Development**
   - Use `npm run dev` for local development
   - Use `npm run check` to validate builds before deploying
   - Use `npm run preview` to test the site locally with Wrangler

2. **Local Testing**
   - Create a separate script for running tests locally
   - Run tests before committing changes
   - Keep test setup separate from the deployment process

3. **Deployment Process**
   - Cloudflare Pages will automatically:
     - Clone the repository
     - Install dependencies with `npm clean-install`
     - Run the build command from cloudflare-pages.config.json
     - Deploy the contents of the output directory

## Environment Variables

- Use Cloudflare Pages environment variables UI for sensitive data
- Different variables can be set for Production vs Preview environments
- Don't hardcode sensitive data in configuration files

## Common Errors and Solutions

1. **Authentication Failure**
   - **Error**: `Password: su: Authentication failure`
   - **Solution**: Remove any commands requiring elevated permissions from build scripts

2. **Missing Dependencies**
   - **Error**: `Cannot find module '...'`
   - **Solution**: Ensure all required dependencies are in the `dependencies` section of package.json

3. **Path Errors**
   - **Error**: `ENOENT: no such file or directory`
   - **Solution**: Verify paths in configuration files are relative to the project root 