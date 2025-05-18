import { getCollection } from 'astro:content';

export async function getAllBlogPosts() {
    const allPosts = await getCollection('blog');
    return allPosts;
}

export async function getAllTags() {
    const allPosts = await getAllBlogPosts();
    // Extract tags, handling potential undefined or non-array tags
    const tags = allPosts.flatMap(post => Array.isArray(post.data.tags) ? post.data.tags : []);

    // Aggregate and unique the tags
    const uniqueTags = [...new Set(tags)];

    return uniqueTags;
} 