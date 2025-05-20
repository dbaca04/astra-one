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
    service: { entrypoint: "astro/assets/services/compile" }, // Use the compile service for Cloudflare compatibility
    experimentalLayout: 'constrained', // Default layout for images
    experimentalObjectFit: 'cover', // Default object-fit style
    experimentalObjectPosition: 'center', // Default object-position style
  },

  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: "simple-svg", // Using simple-svg instead of img-svg to avoid Playwright dependency
        mermaidConfig: {
          theme: "default"
        }
      }]
    ],
  },
});