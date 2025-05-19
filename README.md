# Domdhi: AI-Powered Content Hub

![Domdhi Website Preview](https://github.com/dbaca04/domdhi/assets/preview.jpg)

<!-- dash-content-start -->

Domdhi is a personal content hub exploring the intersection of AI, web development, and creative pursuits. Built with Astro, styled with Tailwind CSS, and deployed on Cloudflare Workers.

## Core Features

- **Project Setup & Structure:**
    - Astro project initialization and structured layout.
    - Base layout components for consistent page structure.
- **Navigation & Content Organization:**
    - Dynamic site navigation (Code, Create, Automate sections).
    - Content collections for Markdown/MDX blog posts and pages with defined frontmatter.
    - Templates for blog posts and section listing pages.
    - Homepage with an introduction, section links, and a feed of the latest articles.
    - Static 'About' and 'Contact' pages.
- **Blog & Content Functionality:**
    - Tagging system for content categorization and display on entries.
    - RSS feed generation for content syndication.
    - Previous/Next entry navigation on blog posts.
    - Table of Contents (TOC) for blog posts with smooth scrolling and active link highlighting.
    - Related posts feature based on shared tags/categories.
    - Dynamic breadcrumb navigation with Schema.org markup.
- **User Experience & Design:**
    - Fully responsive design for desktop, tablet, and mobile.
    - Enhanced content readability and formatting.
    - Improved styling for blog post navigation.
    - Dark theme enhancements for navigation and menus, ensuring accessibility.
    - Consistent glow effect UI for interactive elements.
    - Animated page transitions using Astro View Transitions.
- **Styling & Theming:**
    - Integration with Tailwind CSS for utility-first styling.
    - Project-wide refactor to Tailwind CSS from previous custom styles.
    - Light and dark mode support with good contrast.
    - Specific styling improvements for components like the 'Latest Articles' feed and Journal subscription box.
- **SEO & Performance:**
    - SEO-friendly with canonical URLs and OpenGraph data.
    - Sitemap support.
    - Rich snippet metadata (Schema.org - BlogPosting, Author, Breadcrumbs) for blog posts.
    - Optimized for 100/100 Lighthouse performance.
- **Branding & Accessibility:**
    - Consistent 'Domdhi' branding across the site (text, logo, footer).
    - Addressed site-wide CSS contrast issues for WCAG compliance.

<!-- dash-content-end -->

## Getting Started

To run this project locally:

```bash
# Clone the repository
git clone https://github.com/dbaca04/domdhi.git

# Navigate to the project directory
cd domdhi

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🚀 Project Structure

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run deploy`          | Deploy your production site to Cloudflare        |

## Connect

Follow Domdhi on [Twitter](https://twitter.com/iDomdhi) or check out the [GitHub repository](https://github.com/dbaca04/).
