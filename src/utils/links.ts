/**
 * Utility functions for working with links in the application
 */

/**
 * Checks if a URL is external (not part of the current site)
 * 
 * @param url The URL to check
 * @param siteUrl The site's base URL (defaults to import.meta.env.SITE or domdhi.com)
 * @returns True if the URL is external
 */
export function isExternalLink(url: string, siteUrl?: string): boolean {
    // Skip fragment-only links and relative links
    if (!url || url.startsWith('#') || url.startsWith('/')) {
        return false;
    }

    try {
        // Handle relative URLs that don't start with '/'
        if (!url.startsWith('http') && !url.startsWith('//')) {
            return false;
        }

        // Use provided siteUrl, imported SITE, or fallback to domdhi.com
        const baseUrl = siteUrl || import.meta.env.SITE || 'https://domdhi.com';
        const siteHostname = new URL(baseUrl).hostname;
        const urlHostname = new URL(url).hostname;

        // Check if the hostname is different from the site's hostname
        return siteHostname !== urlHostname;
    } catch (error) {
        // If URL parsing fails, consider internal for safety
        console.error(`Error checking if URL is external: ${url}`, error);
        return false;
    }
}

/**
 * Get attributes for external links (rel and title)
 * 
 * @param url The URL of the link
 * @param title Optional custom title for the link
 * @returns Object containing attributes for external links
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
 * Creates a safe link component with proper attributes for external links
 * 
 * This function can be used in JSX-enabled components (.jsx, .tsx)
 * For Astro components, see the SafeLink.astro component
 * 
 * @param href The URL to link to
 * @param attrs Additional link attributes
 * @returns Object with href and additional attributes for the link
 */
export function safeLink(href: string, attrs: Record<string, any> = {}): Record<string, any> {
    if (isExternalLink(href)) {
        // For external links, add security attributes
        return {
            href,
            ...getExternalLinkAttributes(href, attrs.title),
            ...attrs,
        };
    }

    // For internal links, just return the provided attributes
    return { href, ...attrs };
} 