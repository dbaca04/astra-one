# Domdhi: AI-Powered Content Hub

![Domdhi Website Preview](https://github.com/dbaca04/domdhi/assets/preview.jpg)

<!-- dash-content-start -->

Domdhi is a personal space exploring the intersection of AI tools, creativity, and productivity. Built with Astro and deployed on Cloudflare Workers as a [static website](https://developers.cloudflare.com/workers/static-assets/).

Features:

- ✅ Clean, accessible design with dark/light mode support
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support for content
- ✅ Organized content sections (Code, Create, Automate, Journal)

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
