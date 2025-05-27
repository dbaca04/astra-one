# Domdhi: AI-Powered Content Hub

<!-- dash-content-start -->

Domdhi is a personal content hub exploring the intersection of AI, web development, and creative pursuits. Built with Astro, styled with Tailwind CSS, and deployed on Cloudflare Workers.

## Core Features

- **Astro Foundation:**
    - Project initialized with Astro, leveraging its static site generation capabilities.
    - Structured layout with base components for consistent page design.
- **Content Management & Delivery:**
    - Dynamic navigation for "Code", "Create", and "Automate" sections.
    - Markdown/MDX content collections for blog posts and pages with type-safe frontmatter.
    - Dedicated templates for blog posts and section listing pages.
    - Homepage featuring an introduction, section links, and a feed of the latest articles.
    - Static "About" and "Contact" pages.
- **Blogging Capabilities:**
    - Tagging system for content organization and display.
    - Automatic RSS feed generation.
    - "Previous/Next" navigation on individual blog posts.
    - Auto-generated Table of Contents (TOC) with smooth scrolling and active link highlighting.
    - "Related Posts" functionality based on shared tags.
    - Dynamic breadcrumb navigation with Schema.org structured data.
- **Design & User Experience:**
    - Fully responsive design ensuring optimal viewing on all devices.
    - Focus on content readability and clear formatting.
    - Enhanced styling for blog post navigation elements.
    - Accessible dark theme for navigation and menus.
    - Consistent "glow effect" UI for interactive elements.
    - Smooth page transitions powered by Astro View Transitions.
- **Styling & Theming:**
    - Tailwind CSS integration for a utility-first styling approach.
    - Comprehensive refactor from custom CSS to Tailwind.
    - Support for light and dark modes with high contrast ratios.
    - Specific styling enhancements for the "Latest Articles" feed and Journal subscription box.
- **SEO & Performance:**
    - SEO best practices implemented, including canonical URLs and OpenGraph metadata.
    - Automatic sitemap generation.
    - Rich snippet metadata (Schema.org: BlogPosting, Author, Breadcrumbs) for blog posts.
    - Optimized for top Lighthouse performance scores (100/100).
- **Branding & Accessibility:**
    - Consistent "Domdhi" branding (text, logo, footer) throughout the site.
    - Addressed CSS contrast issues site-wide for WCAG AA compliance.

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

## Content Creation Workflow

This section outlines the process for manually triggering AI-powered blog post generation.

### 1. Triggering Content Generation

- **Access Point:** Navigate to `/admin/trigger` in your browser when the local development server is running.
- **Action:**
    - Enter a desired blog post topic into the "Blog Post Topic" field.
    - Click the "Generate Content" button.
- **Expected Outcome:**
    - **Success:** A message like "Content generation process started for topic: \"[Your Topic]\"." will appear.
    - **Error:** If the topic is missing or an API error occurs, an appropriate error message will be displayed on the page.

### 2. API Endpoint: `/api/generate-content`

- **URL:** `/api/generate-content`
- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "topic": "Your desired blog post topic"
  }
  ```
- **Responses:**
    - **Success (200 OK):**
      ```json
      {
        "success": true,
        "message": "Content generation process started for topic: \"[Your Topic]\".",
        "received_topic": "[Your Topic]"
      }
      ```
      *(Note: The actual content generation logic is currently a placeholder. This response confirms the request was received.)*
    - **Error - Invalid Input (400 Bad Request):**
      ```json
      {
        "success": false,
        "error": "'topic' is required and must be a non-empty string."
      }
      ```
    - **Error - Invalid JSON (400 Bad Request):**
      ```json
      {
        "success": false,
        "error": "Invalid JSON in request body."
      }
      ```
    - **Error - Server Error (500 Internal Server Error):**
      ```json
      {
        "success": false,
        "error": "[Error message]",
        "stack": "[Error stack trace]"
      }
      ```

### 3. Logging and Debugging

- **Frontend (`src/pages/admin/trigger.astro`):**
    - Uses `console.error()` for issues during form submission or API calls (viewable in the browser's developer console).
- **Backend (`src/pages/api/generate-content.ts`):**
    - `console.log()`: Logs successfully received topics.
    - `console.error()`: Logs errors related to JSON parsing, invalid input, or unhandled exceptions.
    - (Viewable in the terminal where the `npm run dev` server is running).

### 4. Development Environment

- This workflow has been tested and confirmed to work using the standard Astro development server:
  ```bash
  npm run dev
  ```
- Access the site at `http://localhost:4321`.
- Issues were observed when using `npx wrangler dev`, leading to 404 errors for the API route. For local development of this feature, `npm run dev` is recommended.

### 5. Basic Troubleshooting

- **404 Error for `/api/generate-content`:**
    - Ensure you are using `npm run dev` and not `npx wrangler dev`.
    - Verify the API route file exists at `src/pages/api/generate-content.ts`.
    - Restart the `npm run dev` server.
- **"Topic is required" error:** Ensure the topic field on the `/admin/trigger` page is filled before submitting.
- **Unexpected API errors:** Check the terminal output of the `npm run dev` server for detailed error messages and stack traces from the API endpoint. Check the browser console for frontend errors.


## Connect

Follow Domdhi on [Twitter](https://twitter.com/iDomdhi) or check out the [GitHub repository](https://github.com/dbaca04/).
