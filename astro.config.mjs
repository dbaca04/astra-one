// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import rehypeMermaid from "rehype-mermaid";
import cloudflare from "@astrojs/cloudflare";
// import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: "https://domdhi.com",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin/') &&
        !page.includes('/private/') &&
        !page.includes('.json'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    tailwind()
  ],

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

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
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'github-dark',
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://github.com/shikijs/shiki/blob/main/docs/languages.md
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
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