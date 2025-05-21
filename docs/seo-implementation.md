# Technical Guide: Advanced SEO Implementation in Astro

This document details our comprehensive approach to implementing modern SEO best practices in an Astro-based website. It covers component-based SEO management, robots.txt configuration, sitemap generation, safe external links, and automated testing.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Robots.txt Implementation](#robotstxt-implementation)
3. [Sitemap Generation](#sitemap-generation)
4. [Safe External Link Handling](#safe-external-link-handling)
5. [Conditional Robots Meta Tags](#conditional-robots-meta-tags)
6. [Structured Data (JSON-LD)](#structured-data-json-ld)
7. [SEO Testing Automation](#seo-testing-automation)
8. [Git Hooks for SEO Quality](#git-hooks-for-seo-quality)

## Component Architecture

Our SEO implementation follows a component-based architecture that centralizes SEO management while providing flexibility for individual pages.

### Base Components

We use two primary components:

**BaseHead.astro**
```astro
---
import "../styles/base.css";
import SEO from "./SEO.astro";
import { generateWebsiteSchema } from "../utils/schema";

interface Props {
  title: string;
  description: string;
  image?: string;
  article?: boolean;
  publishDate?: Date;
  modifiedDate?: Date;
  tags?: string[];
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
  allowCrawling?: boolean;
  structuredData?: string;
}

// Props destructuring and default values
const {
  title,
  description,
  image = "/og-image.png",
  article = false,
  // ... other props
  allowCrawling = true,
  structuredData,
} = Astro.props;

// Generate schema.org data if not provided
const websiteSchema = structuredData || generateWebsiteSchema({
  siteUrl,
  siteName,
  description,
  logoUrl,
  sameAs,
});
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
<!-- Additional global metadata -->

<!-- SEO Component -->
<SEO
  title={title}
  description={description}
  canonical={canonicalURL.toString()}
  image={image}
  type={article ? "article" : "website"}
  author={author}
  publishDate={publishDate}
  modifiedDate={modifiedDate}
  tags={tags}
  structuredData={websiteSchema}
  noindex={noindex}
  nofollow={nofollow}
  allowCrawling={allowCrawling}
/>
```

**SEO.astro**
```astro
---
/**
 * SEO Component for Astro
 * This component centralizes all SEO-related meta tags 
 */
import { type CollectionEntry } from "astro:content";
import JsonLdSchema from "./JsonLdSchema.astro";

interface Props {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishDate?: Date;
  modifiedDate?: Date;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  allowCrawling?: boolean;
  structuredData?: string;
}

// Props destructuring and default values
const {
  title,
  description,
  // ... other props
  allowCrawling = true,
  structuredData,
} = Astro.props;

// Build robots directive with conditional crawling
const robotsContent = (() => {
  // If allowCrawling is false, force noindex, nofollow
  if (!allowCrawling) {
    return "noindex, nofollow";
  }
  
  // Otherwise use the individually provided flags
  return [
    ...(noindex ? ["noindex"] : ["index"]),
    ...(nofollow ? ["nofollow"] : ["follow"]),
  ].join(", ");
})();
---

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />

<!-- Robots and Canonical Tags -->
<meta name="robots" content={robotsContent} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph / Facebook Tags -->
<meta property="og:type" content={type} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<!-- Additional OG tags -->

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content={canonicalURL} />
<!-- Additional Twitter tags -->

<!-- Structured Data (JSON-LD) -->
{structuredData && <JsonLdSchema schema={structuredData} />}
```

### Usage Pattern

This architecture allows pages to manage their SEO through a simple props interface:

```astro
---
import BaseHead from '../components/BaseHead.astro';

// Get page-specific content
const { title, description, publishDate } = Astro.props;
---

<html lang="en">
  <head>
    <BaseHead 
      title={title}
      description={description}
      publishDate={publishDate}
      article={true}
    />
  </head>
  <body>
    <!-- Page content -->
  </body>
</html>
```

## Robots.txt Implementation

We implemented a comprehensive `robots.txt` file to guide search engine crawlers on how to navigate our site:

```
# robots.txt for domdhi.com
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$
Disallow: /api/

# Allow crawling of critical content
Allow: /blog/
Allow: /about/
Allow: /contact/

# Sitemap location
Sitemap: https://domdhi.com/sitemap.xml

# Crawl-delay directive for all bots (optional)
Crawl-delay: 10
```

This configuration:
- Allows search engines to crawl most of the site
- Disallows crawling of admin areas, private content, JSON files, and API endpoints
- Explicitly allows crawling of important content areas
- References the sitemap for improved discovery
- Includes a crawl-delay to manage crawler traffic

## Sitemap Generation

Astro's built-in sitemap integration was configured with custom settings in `astro.config.mjs`:

```javascript
import sitemap from "@astrojs/sitemap";

// Configuration
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
  // Other config...
});
```

This setup:
- Sets the site URL for absolute path generation
- Filters out admin, private, and JSON URLs
- Sets a default change frequency and priority
- Automatically updates the lastmod date on build

## Safe External Link Handling

We implemented a robust system for handling external links safely, addressing security and accessibility concerns.

### Link Utilities

First, we created utility functions to identify and enhance external links:

```typescript
// src/utils/links.ts

/**
 * Checks if a URL is external (not part of the current site)
 */
export function isExternalLink(url: string, siteUrl?: string): boolean {
  // Logic to determine if a link is external
  // ...
}

/**
 * Get attributes for external links (rel and title)
 */
export function getExternalLinkAttributes(url: string, title?: string): Record<string, string> {
  if (!isExternalLink(url)) {
    return {};
  }

  try {
    const hostname = new URL(url).hostname;
    const domain = hostname.replace(/^www\./, '');
    
    return {
      rel: 'noopener noreferrer',
      target: '_blank',
      title: title || `Visit ${domain} (opens in a new tab)`,
    };
  } catch (error) {
    // Fallback if URL parsing fails
    console.error(`Error generating external link attributes: ${url}`, error);
    return {
      rel: 'noopener noreferrer',
      target: '_blank',
      title: title || 'External link (opens in a new tab)',
    };
  }
}

/**
 * Creates a safe link component with proper attributes
 */
export function safeLink(href: string, attrs: Record<string, any> = {}): Record<string, any> {
  // Logic to create safe links
  // ...
}
```

### SafeLink Component

Then, we built a component that leverages these utilities:

```astro
---
// SafeLink.astro
import { isExternalLink, getExternalLinkAttributes } from "../utils/links";

interface Props {
    href: string;
    class?: string;
    title?: string;
    ariaLabel?: string;
    [key: string]: any;
}

const { href, title, ...props } = Astro.props;
const isExternal = isExternalLink(href);
const externalAttrs = isExternal ? getExternalLinkAttributes(href, title) : {};
const allProps = {
    href,
    ...props,
    ...externalAttrs,
};
---

<a {...allProps}>
    <slot />
    {isExternal && (
        <span class="sr-only"> (opens in a new tab)</span>
    )}
</a>
```

### Benefits

This implementation:
- Automatically adds `rel="noopener noreferrer"` to external links to prevent security vulnerabilities
- Adds descriptive title attributes for better accessibility
- Includes screen reader text to indicate when links open in new tabs
- Seamlessly integrates with Astro's component system

## Conditional Robots Meta Tags

We enhanced our SEO component to support conditional control over search engine indexing:

```astro
---
// SEO.astro partial

interface Props {
  // ...other props
  noindex?: boolean;
  nofollow?: boolean;
  allowCrawling?: boolean;
}

const {
  // ...other props
  noindex = false,
  nofollow = false,
  allowCrawling = true,
} = Astro.props;

// Build robots directive with conditional logic
const robotsContent = (() => {
  // If allowCrawling is false, force noindex, nofollow
  if (!allowCrawling) {
    return "noindex, nofollow";
  }
  
  // Otherwise use the individually provided flags
  return [
    ...(noindex ? ["noindex"] : ["index"]),
    ...(nofollow ? ["nofollow"] : ["follow"]),
  ].join(", ");
})();
---

<!-- Robots meta tag -->
<meta name="robots" content={robotsContent} />
```

This allows for:
- Global control via the `allowCrawling` prop
- Granular control via individual `noindex` and `nofollow` props
- Easy integration with both admin/private pages and public content

## Structured Data (JSON-LD)

Our implementation includes structured data capabilities through a dedicated JSON-LD component:

```astro
---
// JsonLdSchema.astro
interface Props {
  schema: string;
}

const { schema } = Astro.props;
---

<script type="application/ld+json" set:html={schema} />
```

We use utility functions to generate different schema types:

```typescript
// src/utils/schema.ts

export interface WebsiteSchemaData {
  siteUrl: string;
  siteName: string;
  description: string;
  logoUrl: string;
  sameAs?: string[]; // Social media URLs
}

export function generateWebsiteSchema(data: WebsiteSchemaData): string {
  // Generate JSON-LD for website
  // ...
}

export interface BlogPostSchemaData {
  title: string;
  description: string;
  publishDate: Date;
  // ...other properties
}

export function generateBlogPostSchema(data: BlogPostSchemaData): string {
  // Generate JSON-LD for blog posts
  // ...
}
```

This structured data implementation:
- Enhances search results with rich snippets
- Provides search engines with explicit semantic information
- Supports multiple schema types (Website, BlogPosting, etc.)
- Integrates seamlessly with existing components

## SEO Testing Automation

We implemented a comprehensive testing suite to validate SEO best practices:

```javascript
// scripts/seo-test.js
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration for Lighthouse tests
const LIGHTHOUSE_CONFIG = {
  urls: [
    'http://localhost:4321/',
    'http://localhost:4321/blog/',
    'http://localhost:4321/about/',
  ],
  thresholds: {
    performance: 0.7,
    accessibility: 0.9,
    'best-practices': 0.9,
    seo: 0.9,
  },
  // ...additional config
};

// Function to validate robots.txt format
function validateRobotsTxt() {
  // Validation logic
  // ...
}

// Function to check images for alt text
function checkImagesForAltText() {
  // Alt text validation logic
  // ...
}

// Function to run all checks
function runAllChecks() {
  const robotsValid = validateRobotsTxt();
  const imagesValid = checkImagesForAltText();
  
  if (!robotsValid || !imagesValid) {
    process.exit(1);
  }
  
  console.log('✅ All SEO checks passed successfully');
}

// Command handling logic
// ...
```

The script features:
- Validation of `robots.txt` format and directives
- Checks for image alt text
- Lighthouse CI integration for comprehensive SEO audits
- Command-line interface for manual and automated testing

## Git Hooks for SEO Quality

We integrated our SEO checks into the development workflow using Git hooks:

### Configuration in package.json

```json
{
  "scripts": {
    "seo:check": "node scripts/seo-test.js",
    "seo:lighthouse": "node scripts/seo-test.js --lighthouse",
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "public/robots.txt": [
      "node scripts/seo-test.js"
    ],
    "src/**/*.{astro,ts,js,jsx,tsx,md,mdx}": [
      "node scripts/seo-test.js"
    ]
  }
}
```

### Pre-commit Hook

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged to check SEO requirements
npx lint-staged

# Additional SEO validation checks
echo "🔍 Running additional SEO checks..."
npm run seo:check
```

This setup:
- Runs SEO checks automatically before every commit
- Validates all modified files that might impact SEO
- Prevents commits that would break SEO requirements
- Provides immediate feedback in the development workflow

## Conclusion

Our SEO implementation represents a comprehensive approach that covers:

1. **Component Architecture**: Centralized SEO management with flexible props
2. **Robots.txt**: Clear directives for search engine crawling
3. **Sitemap Generation**: Automatic sitemap creation with custom filtering
4. **Safe External Links**: Security and accessibility for outbound links
5. **Conditional Indexing**: Granular control over page indexing
6. **Structured Data**: Enhanced search results with JSON-LD
7. **Testing Automation**: Continuous validation of SEO best practices
8. **Git Hooks**: Integrated quality checks in the development workflow

This technical foundation ensures that our Astro-based site follows SEO best practices by design, making it easier for both developers and content creators to maintain excellent search engine visibility without requiring deep SEO expertise for every change.

## Next Steps

Future enhancements could include:
- Advanced schema.org types for specific content sections
- Automated performance optimization for Core Web Vitals
- Page-specific SEO scoring and recommendations
- Integration with a headless CMS for content-driven SEO metadata
- A/B testing capabilities for SEO strategies 