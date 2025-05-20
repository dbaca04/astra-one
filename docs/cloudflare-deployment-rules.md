# Cloudflare Pages Deployment Guidelines

## Configuration Requirements

- **Static Output Mode**
  - Always use `output: "static"` in astro.config.mjs
  - Do not use any adapter for static output mode
  - Avoid server-side rendering features
  
  ```typescript
  // ✅ DO: Use static output mode without an adapter
  export default defineConfig({
    output: "static",
    // No adapter needed for static output
  });

  // ❌ DON'T: Use SSR mode or unnecessary adapters
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
  - Use the `"pre-mermaid"` strategy for rehype-mermaid
  - This strategy uses client-side rendering and avoids Playwright dependency issues
  
  ```typescript
  markdown: {
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: "pre-mermaid", 
        mermaidConfig: {
          theme: "default"
        }
      }]
    ],
  },
  ```

- **Image Optimization**
  - Use the Sharp service for image processing
  - When deployed to Cloudflare, Astro will automatically use an appropriate fallback
  
  ```typescript
  // ✅ DO: Use the Sharp service
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
  
  // ❌ DON'T: Use a non-existent service
  image: {
    service: { entrypoint: "astro/assets/services/compile" }, // This doesn't exist
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

4. **Mermaid Rendering Errors**
   - **Error**: `browserType.launch: Executable doesn't exist`
   - **Solution**: Use `strategy: "pre-mermaid"` instead of `"img-svg"` for rehype-mermaid

5. **Image Service Errors**
   - **Error**: `Missing "./assets/services/compile" specifier in "astro" package`
   - **Solution**: Use `service: { entrypoint: "astro/assets/services/sharp" }` instead 