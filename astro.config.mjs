// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import rehypeMermaid from "rehype-mermaid";
// import cloudflare from "@astrojs/cloudflare";
// import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: "https://Domdhi.com",
  integrations: [mdx(), sitemap(), tailwind()],

  output: "static",
  // Removed adapter since we're using static output mode

  experimental: {
    responsiveImages: true,
  },

  image: {
    // Use the default Sharp service for local builds
    // For Cloudflare deploy, this will use the appropriate fallback
    service: { entrypoint: "astro/assets/services/sharp" },
    experimentalLayout: 'constrained', // Default layout for images
    experimentalObjectFit: 'cover', // Default object-fit style
    experimentalObjectPosition: 'center', // Default object-position style
  },

  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: "pre-mermaid", // Using pre-mermaid which doesn't require Playwright
        mermaidConfig: {
          theme: "default"
        }
      }]
    ],
  },
});