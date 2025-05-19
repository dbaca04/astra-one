import { getCollection, type CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

/**
 * Filter blog posts by specific section
 * @param posts Array of blog posts to filter
 * @param section Section name to filter by (e.g., "code", "create", "automate")
 * @returns Filtered array of blog posts belonging to the specified section
 */
export async function filterPostsBySection(section: string): Promise<BlogPost[]> {
    const allPosts = await getCollection('blog');

    // Filter posts by the provided section and sort by date (newest first)
    return allPosts
        .filter(post => post.data.category === section)
        .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

/**
 * Get all available blog posts sorted by publication date
 * @returns Array of all blog posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<BlogPost[]> {
    const allPosts = await getCollection('blog');

    // Sort posts by date (newest first)
    return allPosts.sort((a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
}

/**
 * Get the list of all unique sections used in blog posts
 * @returns Array of unique section names
 */
export async function getAllSections(): Promise<string[]> {
    const allPosts = await getCollection('blog');

    // Extract all sections and filter out undefined/null values
    const sections = allPosts
        .map(post => post.data.category)
        .filter((section): section is string => !!section);

    // Return unique section names
    return Array.from(new Set(sections));
}

/**
 * Filter blog posts by a list of tags
 * @param posts Array of blog posts to filter
 * @param tags Array of tag names to filter by
 * @returns Filtered array of blog posts that have at least one of the specified tags
 */
export async function filterPostsByTags(tags: string[]): Promise<BlogPost[]> {
    const allPosts = await getCollection('blog');

    // Filter posts that have at least one tag from the provided tags array
    return allPosts
        .filter(post => {
            const postTags = post.data.tags || [];
            return tags.some(tag => postTags.includes(tag));
        })
        .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
} 