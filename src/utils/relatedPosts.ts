export interface PostFrontmatter {
    title: string;
    date: Date;
    description?: string;
    category?: string;
    tags?: string[];
    heroImage?: string;
    // Assuming slug is part of frontmatter or derived for URL generation
    slug: string;
}

export interface Post {
    frontmatter: PostFrontmatter;
    url?: string; // Astro.glob() provides a URL property for .md/.astro files
    // Add other properties if Astro.glob() returns more that are needed
}

export interface RelatedPost {
    title: string;
    url: string;
    date?: Date; // Optional, for display or further sorting if needed
}

/**
 * Finds related blog posts based on shared tags and category.
 *
 * @param currentPost The current post for which to find related content.
 * @param allPosts An array of all available blog posts.
 * @param maxPosts The maximum number of related posts to return (default: 3).
 * @returns An array of related posts.
 */
export function getRelatedPosts(
    currentPost: Post,
    allPosts: Post[],
    maxPosts: number = 3
): RelatedPost[] {
    const { tags: currentTags, category: currentCategory, slug: currentSlug } = currentPost.frontmatter;

    // Filter out the current post and posts without necessary frontmatter
    const otherPosts = allPosts.filter(post =>
        post.frontmatter.slug !== currentSlug &&
        post.frontmatter.title &&
        post.frontmatter.slug
    );

    if (!otherPosts.length) {
        return [];
    }

    // Calculate shared tags and score posts
    const scoredPosts = otherPosts.map(post => {
        let sharedTagsCount = 0;
        if (currentTags && post.frontmatter.tags) {
            sharedTagsCount = post.frontmatter.tags.filter(tag => currentTags.includes(tag)).length;
        }
        return {
            ...post,
            sharedTagsCount,
            // Ensure date is a Date object for sorting
            dateObj: new Date(post.frontmatter.date)
        };
    });

    // Sort by shared tags (desc), then by publication date (desc)
    scoredPosts.sort((a, b) => {
        if (b.sharedTagsCount !== a.sharedTagsCount) {
            return b.sharedTagsCount - a.sharedTagsCount;
        }
        return b.dateObj.getTime() - a.dateObj.getTime();
    });

    let relatedPosts: Post[] = [];

    // Get posts with shared tags
    if (currentTags && currentTags.length > 0) {
        relatedPosts = scoredPosts.filter(post => post.sharedTagsCount > 0);
    }

    // If not enough posts from tags, try by category
    if (relatedPosts.length < maxPosts && currentCategory) {
        const categoryPosts = scoredPosts.filter(
            post =>
                post.frontmatter.category === currentCategory &&
                !relatedPosts.find(rp => rp.frontmatter.slug === post.frontmatter.slug) && // Exclude already selected posts
                post.sharedTagsCount === 0 // Prioritize posts not already matched by tags, or allow if tags didn't yield enough
        );
        // No need to re-sort categoryPosts by date as scoredPosts is already sorted by date as secondary criteria
        relatedPosts.push(...categoryPosts);
    }

    // Ensure unique posts in case of overlap (though logic above tries to prevent it)
    const uniqueRelatedPosts = Array.from(new Map(relatedPosts.map(p => [p.frontmatter.slug, p])).values());

    // Limit to maxPosts and transform to RelatedPost format
    return uniqueRelatedPosts
        .slice(0, maxPosts)
        .map(post => ({
            title: post.frontmatter.title,
            // Prefer post.url if available (from Astro.glob), otherwise construct from slug
            url: post.url || `/blog/${post.frontmatter.slug}/`,
            date: new Date(post.frontmatter.date) // Ensure date is a Date object
        }));
} 