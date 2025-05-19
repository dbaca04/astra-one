/**
 * Utility functions for generating Schema.org JSON-LD structured data
 */

export interface BlogPostSchemaData {
    title: string;
    description: string;
    publishDate: Date;
    updateDate?: Date;
    author: string;
    slug: string;
    tags?: string[];
    image?: string;
    imageAlt?: string;
    siteUrl: string;
    siteName: string;
    logoUrl: string;
}

export interface WebsiteSchemaData {
    siteUrl: string;
    siteName: string;
    description: string;
    logoUrl: string;
    sameAs?: string[]; // Social media URLs
}

interface SchemaData {
    "@context": string;
    "@type": string;
    mainEntityOfPage?: {
        "@type": string;
        "@id": string;
    };
    headline?: string;
    description?: string;
    datePublished?: string;
    dateModified?: string;
    author?: {
        "@type": string;
        name: string;
        url: string;
    };
    publisher?: {
        "@type": string;
        name: string;
        logo?: {
            "@type": string;
            url: string;
        };
    };
    isPartOf?: {
        "@type": string;
        name: string;
        url: string;
    };
    image?: {
        "@type": string;
        url: string;
        caption?: string;
    };
    url?: string;
    name?: string;
    potentialAction?: any[];
    sameAs?: string[];
    keywords?: string;
    [key: string]: any;
}

/**
 * Generates Schema.org JSON-LD structured data for a blog post
 */
export function generateBlogPostSchema(data: BlogPostSchemaData): string {
    const {
        title,
        description,
        publishDate,
        updateDate,
        author,
        slug,
        tags,
        image,
        imageAlt,
        siteUrl,
        siteName,
        logoUrl,
    } = data;

    const postUrl = `${siteUrl}/blog/${slug}/`;

    // Create the JSON-LD structured data
    const schemaData: SchemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": postUrl
        },
        "headline": title,
        "description": description,
        "datePublished": publishDate.toISOString(),
        "dateModified": updateDate ? updateDate.toISOString() : publishDate.toISOString(),
        "author": {
            "@type": "Person",
            "name": author,
            "url": siteUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": siteName,
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}${logoUrl}`
            }
        },
        "isPartOf": {
            "@type": "Blog",
            "name": siteName,
            "url": `${siteUrl}/blog/`
        }
    };

    // Add image if available
    if (image) {
        const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
        schemaData.image = {
            "@type": "ImageObject",
            "url": imageUrl,
            "caption": imageAlt || title
        };
    }

    // Add keywords if tags are available
    if (tags && tags.length > 0) {
        schemaData.keywords = tags.join(",");
    }

    return JSON.stringify(schemaData);
}

/**
 * Generates Schema.org JSON-LD structured data for the website
 */
export function generateWebsiteSchema(data: WebsiteSchemaData): string {
    const {
        siteUrl,
        siteName,
        description,
        logoUrl,
        sameAs,
    } = data;

    // Create the JSON-LD structured data for Website
    const websiteSchema: SchemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": siteUrl,
        "description": description,
        "potentialAction": [
            {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        ]
    };

    // Add social profiles if available
    if (sameAs && sameAs.length > 0) {
        websiteSchema.sameAs = sameAs;
    }

    // Create organization schema
    const organizationSchema: SchemaData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteName,
        "url": siteUrl,
        "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}${logoUrl}`
        }
    };

    // Add social profiles to organization if available
    if (sameAs && sameAs.length > 0) {
        organizationSchema.sameAs = sameAs;
    }

    // Return both schemas as an array
    return JSON.stringify([websiteSchema, organizationSchema]);
} 