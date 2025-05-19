// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
// import react from '@astrojs/react';

// Removing cloudflare adapter as it's not needed
import rehypeMermaidPre from './scripts/rehype-mermaid-pre.mjs';

// https://astro.build/config
export default defineConfig({
  site: "https://Domdhi.com",
  integrations: [mdx(), sitemap(), tailwind()],

  // Removed cloudflare adapter

  experimental: {
    responsiveImages: true,
  },

  image: {
    // Using standard built-in "astro:assets" without specifying service 
    // to use default static image optimization
    experimentalLayout: 'constrained', // Default layout for images
    experimentalObjectFit: 'cover', // Default object-fit style
    experimentalObjectPosition: 'center', // Default object-position style
  },

  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [rehypeMermaidPre],
  },
});