export const prerender = false;

import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

// const adminSecret = import.meta.env.ADMIN_SECRET; // Removed unused variable

export const POST: APIRoute = async ({ request, cookies }) => {
    // Authentication check - now consistent with admin page frontmatter
    const sessionCookie = cookies.get("session");
    if (!sessionCookie || sessionCookie.value !== "admin") { // Changed check to hardcoded 'admin'
        return new Response(
            JSON.stringify({ message: "Unauthorized" }),
            { status: 401 }
        );
    }

    try {
        const { slug } = await request.json() as { slug: string }; // Fix: Cast to expected type

        if (!slug) {
            return new Response(
                JSON.stringify({ message: "Slug is required" }),
                { status: 400 }
            );
        }

        const publishedPostPath = path.join(
            process.cwd(),
            `src/content/blog/${slug}.md` // Assuming the slug directly maps to filename.md
        );

        // Check if the published post file exists
        try {
            await fs.access(publishedPostPath);
        } catch (error) {
            return new Response(
                JSON.stringify({ message: `Published post with slug "${slug}" not found.` }),
                { status: 404 }
            );
        }

        // Read the file content
        const fileContent = await fs.readFile(publishedPostPath, 'utf-8');

        // Parse frontmatter and content
        const { data: frontmatter, content } = matter(fileContent);

        // Update frontmatter for unpublishing
        frontmatter.draft = true;
        delete frontmatter.pubDate; // Remove the publication date
        if (frontmatter.status === 'Published') { // Optionally update status if a status field is used
            frontmatter.status = 'Draft';
        }

        // Reconstruct the content with updated frontmatter
        const updatedContent = matter.stringify(content, frontmatter);

        // Determine the new file path in drafts
        const draftFileName = path.basename(publishedPostPath);
        const draftPostPath = path.join(
            process.cwd(),
            `src/content/drafts/${draftFileName}`
        );

        // Write the updated content to the new draft location
        await fs.writeFile(draftPostPath, updatedContent);

        // Remove the original published file
        await fs.unlink(publishedPostPath);

        return new Response(
            JSON.stringify({ message: `Post with slug ${slug} unpublished successfully` }),
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error unpublishing post:", error);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}; 