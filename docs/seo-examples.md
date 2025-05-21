# SEO Component Examples

This document provides practical examples of how to use the SEO component in various scenarios.

## Basic Page Example

```astro
---
// src/pages/about.astro
import BaseHead from "../components/BaseHead.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
---

<html lang="en">
  <head>
    <BaseHead
      title="About Us | Domdhi.com"
      description="Learn more about our company, mission, and team."
    />
  </head>
  <body>
    <Header />
    <main>
      <h1>About Us</h1>
      <!-- Page content -->
    </main>
    <Footer />
  </body>
</html>
```

## Blog Post Example

```astro
---
// src/pages/blog/[slug].astro
import { getCollection, getEntry } from "astro:content";
import BlogPostLayout from "../../layouts/BlogPost.astro";

export async function getStaticPaths() {
  const blogEntries = await getCollection("blog");
  return blogEntries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<BlogPostLayout
  title={entry.data.title}
  description={entry.data.description}
  image={entry.data.heroImage}
  publishDate={new Date(entry.data.date)}
  modifiedDate={entry.data.updatedDate ? new Date(entry.data.updatedDate) : undefined}
  tags={entry.data.tags}
  author={entry.data.author}
>
  <Content />
</BlogPostLayout>
```

## No-Index Page Example

For pages that should not be indexed by search engines:

```astro
---
// src/pages/private-dashboard.astro
import BaseHead from "../components/BaseHead.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
---

<html lang="en">
  <head>
    <BaseHead
      title="Private Dashboard"
      description="User dashboard for account management"
      noindex={true}
      nofollow={true}
    />
  </head>
  <body>
    <Header />
    <main>
      <h1>Dashboard</h1>
      <!-- Dashboard content -->
    </main>
    <Footer />
  </body>
</html>
```

## Product Page with Structured Data

Example with custom structured data for a product:

```astro
---
// src/pages/products/[id].astro
import BaseHead from "../../components/BaseHead.astro";
import Header from "../../components/Header.astro";
import Footer from "../../components/Footer.astro";
import { getProduct } from "../../lib/products";

export async function getStaticPaths() {
  const products = await getProducts();
  return products.map(product => ({
    params: { id: product.id },
    props: { product },
  }));
}

const { product } = Astro.props;

// Generate product structured data
const productSchema = JSON.stringify({
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": new URL(product.image, Astro.site).toString(),
  "brand": {
    "@type": "Brand",
    "name": "Domdhi"
  },
  "offers": {
    "@type": "Offer",
    "url": Astro.url.toString(),
    "priceCurrency": "USD",
    "price": product.price,
    "availability": product.inStock 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock"
  }
});
---

<html lang="en">
  <head>
    <BaseHead
      title={`${product.name} | Products`}
      description={product.description}
      image={product.image}
      structuredData={productSchema}
    />
  </head>
  <body>
    <Header />
    <main>
      <h1>{product.name}</h1>
      <!-- Product details -->
    </main>
    <Footer />
  </body>
</html>
```

## Multiple Language Support

Example for a page with language-specific metadata:

```astro
---
// src/pages/[lang]/index.astro
import BaseHead from "../../components/BaseHead.astro";
import Header from "../../components/Header.astro";
import Footer from "../../components/Footer.astro";

export function getStaticPaths() {
  return [
    { params: { lang: 'en' } },
    { params: { lang: 'es' } },
    { params: { lang: 'fr' } }
  ];
}

const { lang } = Astro.params;

// Language-specific content
const content = {
  en: {
    title: "Welcome to Our Website",
    description: "Discover our products and services",
  },
  es: {
    title: "Bienvenido a Nuestro Sitio Web",
    description: "Descubre nuestros productos y servicios",
  },
  fr: {
    title: "Bienvenue sur Notre Site Web",
    description: "Découvrez nos produits et services",
  }
}[lang];

// Construct alternate language URLs
const alternateUrls = {
  en: new URL("/en/", Astro.site).toString(),
  es: new URL("/es/", Astro.site).toString(),
  fr: new URL("/fr/", Astro.site).toString(),
};
---

<html lang={lang}>
  <head>
    <BaseHead
      title={content.title}
      description={content.description}
    />
    <!-- Add hreflang links for multiple language support -->
    <link rel="alternate" hreflang="en" href={alternateUrls.en} />
    <link rel="alternate" hreflang="es" href={alternateUrls.es} />
    <link rel="alternate" hreflang="fr" href={alternateUrls.fr} />
    <link rel="alternate" hreflang="x-default" href={alternateUrls.en} />
  </head>
  <body>
    <Header />
    <main>
      <h1>{content.title}</h1>
      <!-- Page content -->
    </main>
    <Footer />
  </body>
</html>
```

## Direct Usage in a Component

For cases where you need to use the SEO component directly:

```astro
---
// src/pages/custom-page.astro
import SEO from "../components/SEO.astro";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <SEO
      title="Custom Page Title"
      description="This is a custom page with direct SEO component usage."
      image="/images/custom-image.jpg"
      type="website"
    />
    
    <!-- Other head elements -->
  </head>
  <body>
    <!-- Page content -->
  </body>
</html>
```

## Tips for Using the SEO Component

1. **For blog posts**, always include `publishDate` and `tags` to improve search engine understanding of your content.

2. **For e-commerce pages**, use structured data to enhance search results with product details like price, availability, and ratings.

3. **For internal/private pages**, use the `noindex` and `nofollow` props to prevent search engines from indexing or following links.

4. **For localized content**, be sure to specify the appropriate `lang` attribute in the HTML tag and use `hreflang` links.

5. **Use semantic URLs** to improve both user experience and SEO. The SEO component will automatically create canonical URLs based on your site's configuration.

6. **Ensure images have proper dimensions** for Open Graph and Twitter Cards (ideally 1200×630 pixels).

7. **Check your meta tags** using browser developer tools or validation services like Google's Structured Data Testing Tool. 