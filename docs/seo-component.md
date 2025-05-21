# SEO Component Documentation

The `SEO.astro` component is a reusable Astro component that encapsulates all SEO-related meta tags to ensure consistent and comprehensive SEO across all pages of the site.

## Features

- Generates SEO meta tags (title, description)
- Handles canonical URLs
- Adds Open Graph meta tags for social media sharing
- Adds Twitter Card meta tags for Twitter
- Supports structured data (JSON-LD) for rich results in search engines
- Configurable robot directives (noindex, nofollow)
- SEO best practices for article metadata (publish date, modified date, author, tags)
- Dynamic image URL handling

## Usage

The SEO component can be used in any Astro page or layout. It's most commonly used in layout components like `BaseLayout.astro` or directly in the `<head>` section of your pages.

### Basic Usage

```astro
---
import SEO from '../components/SEO.astro';
---

<head>
  <SEO
    title="My Page Title"
    description="A description of my page for search engines and social media."
  />
</head>
```

### Advanced Usage

```astro
---
import SEO from '../components/SEO.astro';
import { generateBlogPostSchema } from '../utils/schema';

// Generate structured data for the current blog post
const schema = generateBlogPostSchema({
  title: "My Blog Post Title",
  description: "Blog post description",
  publishDate: new Date("2023-01-01"),
  // ... other required properties
});
---

<head>
  <SEO
    title="My Blog Post Title"
    description="Blog post description"
    image="/images/blog-post-image.jpg"
    type="article"
    author="John Doe"
    publishDate={new Date("2023-01-01")}
    modifiedDate={new Date("2023-01-15")}
    tags={["blog", "astro", "seo"]}
    structuredData={schema}
  />
</head>
```

## Available Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | - | The page title. Used for `<title>` and Open Graph/Twitter Card. |
| `description` | `string` | Yes | - | The page description. Used for meta description and Open Graph/Twitter Card. |
| `canonical` | `string` | No | `Astro.url.pathname` | The canonical URL for the page. If not provided, the current URL is used. |
| `image` | `string` | No | `/og-image.png` | The image used for Open Graph/Twitter Card. |
| `imageAlt` | `string` | No | Same as `title` | The alt text for the Open Graph/Twitter Card image. |
| `type` | `"website" \| "article" \| "profile"` | No | `"website"` | The Open Graph type. |
| `author` | `string` | No | `"Domdhi"` | The author of the content (mainly for articles). |
| `publishDate` | `Date` | No | - | The date the content was published (mainly for articles). |
| `modifiedDate` | `Date` | No | - | The date the content was last modified (mainly for articles). |
| `tags` | `string[]` | No | `[]` | Tags or keywords for the content (mainly for articles). |
| `noindex` | `boolean` | No | `false` | Whether to prevent search engines from indexing the page. |
| `nofollow` | `boolean` | No | `false` | Whether to prevent search engines from following links on the page. |
| `structuredData` | `string` | No | - | JSON-LD structured data for the page. |

## Integration with Layouts

The SEO component is integrated with the site's layout components through the `BaseHead.astro` component. This ensures that SEO meta tags are consistently applied across all pages.

### BaseHead.astro

The `BaseHead.astro` component sets up all the global `<head>` elements, including the SEO component with appropriate props.

```astro
---
import "../styles/base.css";
import SEO from "./SEO.astro";
// ...other imports

interface Props {
  title: string;
  description: string;
  // ...other props
}

const { title, description, /* ...other props */ } = Astro.props;
// ...other code
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<!-- ...other meta tags -->

<!-- SEO Tags -->
<SEO 
  title={title}
  description={description}
  // ...other props
/>

<!-- ...other head elements -->
```

## Best Practices

1. **Always provide a unique title and description** for each page.
2. **Keep titles under 60 characters** and descriptions under 160 characters for optimal display in search results.
3. **Use canonical URLs** to avoid duplicate content issues.
4. **Provide high-quality images** for Open Graph/Twitter Card (recommended: 1200×630 pixels).
5. **Add article metadata** (author, publish date, etc.) for blog posts and news articles.
6. **Use structured data** to enhance search engine results with rich snippets.
7. **Don't overuse noindex/nofollow** – only use when necessary (e.g., duplicate content, private pages).

## Debugging SEO Meta Tags

To verify that SEO meta tags are working correctly:

1. Use your browser's developer tools to inspect the `<head>` section.
2. Use tools like Google's Rich Results Test, Facebook's Sharing Debugger, and Twitter's Card Validator.
3. Check that canonical URLs are correctly generated.
4. Verify that structured data is valid using Google's Structured Data Testing Tool.

## Further Improvements

- Add support for more Open Graph/Twitter Card properties.
- Enhance structured data support for different content types.
- Implement language-specific metadata.
- Add support for meta tags specific to other platforms (e.g., Pinterest). 