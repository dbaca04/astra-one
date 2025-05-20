# Deployment Guidelines and Requirements

## Cloudflare Deployment Configuration

These configurations **MUST NOT** be changed to ensure successful Cloudflare deployments:

### 1. Static Site Generation

The site **MUST** use static output mode in the Astro configuration. SSR (Server-Side Rendering) is **NOT** compatible with our Cloudflare deployment setup.

```javascript
// astro.config.mjs
export default defineConfig({
  // ...
  output: "static", // MUST remain "static" - DO NOT change to "server"
  adapter: cloudflare(),
  // ...
});
```

### 2. Mermaid Diagram Implementation

Mermaid diagrams **MUST** be rendered using the `img-svg` strategy in rehype-mermaid. This ensures diagrams are rendered properly during the build process and displayed correctly in the browser.

```javascript
// astro.config.mjs
markdown: {
  syntaxHighlight: false,
  rehypePlugins: [
    [rehypeMermaid, {
      strategy: "img-svg", // MUST remain "img-svg"
      mermaidConfig: {
        theme: "default"
      }
    }]
  ],
},
```

### 3. Playwright Dependencies

The Cloudflare build process **MUST** include installation of Playwright and its Chromium browser, which are required for Mermaid rendering:

```json
// cloudflare-pages.config.json
{
  "build": {
    "command": "npm install -D @playwright/test@latest && npx playwright install chromium --with-deps && npm run deploy",
    "output_directory": "dist",
    "root_directory": ""
  }
}
```

### 4. React Dependencies

The site **MUST NOT** use React components that require SSR. Any React integration must be client-side only.

## Mermaid Integration Guidelines

### 1. Component Structure

The Mermaid component **MUST** use the Astro component format (`.astro` extension), not React (`.jsx` or `.tsx`).

### 2. Client-Side Rendering

Mermaid charts **MUST** be initialized on the client-side using the scripts in the layout files:

- `src/layouts/BlogPost.astro`
- `src/layouts/ContentPage.astro`

### 3. Markdown Usage

Mermaid diagrams in Markdown content **MUST** be written using the standard code block format:

````markdown
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

## Why These Requirements Matter

1. **Cloudflare Compatibility**: Cloudflare Pages has specific limitations including constraints on SSR and third-party libraries.

2. **Build Performance**: Using the correct Mermaid configuration ensures diagrams are properly pre-rendered during the build process.

3. **Avoid Deployment Failures**: Previous configuration changes led to deployment failures. Maintaining these guidelines ensures stable deployments.

## Deployment Process

Always use the provided scripts for testing and deploying:

- `scripts/test-build.sh`: Tests the build process locally
- `scripts/deploy-cloudflare.sh`: Handles the Cloudflare deployment setup

## Making Changes

If changes to these configurations are absolutely necessary:

1. Create a separate branch for testing
2. Verify the build works locally using the test script
3. Test the deployment in a staging environment
4. Document any changes thoroughly
5. Get approval before merging to the main branch 