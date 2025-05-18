import { getCollection, type CollectionEntry } from 'astro:content';

// Define a type that includes the section property
type BlogData = CollectionEntry<'blog'>['data'];
type BlogDataWithSection = BlogData & { section?: string };

/**
 * Get the previous and next blog posts based on chronological order
 * @param currentPostId The ID of the current blog post
 * @returns An object containing the previous and next posts
 */
export async function getAdjacentPosts(currentPostId: string) {
    // Get all blog posts
    const allPosts = await getCollection('blog');

    // Sort posts by publication date in descending order (newest first)
    const sortedPosts = allPosts.sort((a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

    // Find the index of the current post
    const currentIndex = sortedPosts.findIndex(post => post.id === currentPostId);

    // If the post is not found, return undefined for both previous and next
    if (currentIndex === -1) {
        return { prev: undefined, next: undefined };
    }

    // Get the previous post (newer in chronological order, earlier in the array)
    const prev = currentIndex > 0 ? sortedPosts[currentIndex - 1] : undefined;

    // Get the next post (older in chronological order, later in the array)
    const next = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : undefined;

    return { prev, next };
}

/**
 * Get the previous and next blog posts within the same section/category
 * @param currentPostId The ID of the current blog post
 * @returns An object containing the previous and next posts within the same section
 */
export async function getAdjacentPostsInSection(currentPostId: string) {
    // Get all blog posts
    const allPosts = await getCollection('blog');

    // Find the current post to get its section
    const currentPost = allPosts.find(post => post.id === currentPostId);

    // Use type assertion to access section property
    const currentPostData = currentPost?.data as BlogDataWithSection;

    // If the post is not found or has no section, return undefined for both previous and next
    if (!currentPost || !currentPostData.section) {
        return { prev: undefined, next: undefined };
    }

    // Filter posts to only include those in the same section
    const sectionPosts = allPosts.filter(post => {
        const postData = post.data as BlogDataWithSection;
        return postData.section === currentPostData.section;
    });

    // Sort posts by publication date in descending order (newest first)
    const sortedSectionPosts = sectionPosts.sort((a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

    // Find the index of the current post within the filtered section posts
    const currentSectionIndex = sortedSectionPosts.findIndex(post => post.id === currentPostId);

    // If the post is not found in the section (shouldn't happen), return undefined for both
    if (currentSectionIndex === -1) {
        return { prev: undefined, next: undefined };
    }

    // Get the previous post in the section
    const prev = currentSectionIndex > 0 ? sortedSectionPosts[currentSectionIndex - 1] : undefined;

    // Get the next post in the section
    const next = currentSectionIndex < sortedSectionPosts.length - 1
        ? sortedSectionPosts[currentSectionIndex + 1]
        : undefined;

    return { prev, next };
} 