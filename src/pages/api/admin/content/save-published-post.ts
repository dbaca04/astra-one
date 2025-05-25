export const prerender = false;
import type { APIRoute } from 'astro';
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import matter from "gray-matter";

interface SavePublishedPostBody {
    slug: string;
    frontmatter: Record<string, any>;
    body: string;
}

export const POST: APIRoute = async ({ request, cookies }) => {
    // Authentication Check
    const sessionCookie = cookies.get('session');
    if (!sessionCookie || sessionCookie.value !== 'admin') {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (request.headers.get("Content-Type") !== "application/json") {
        return new Response(JSON.stringify({ message: "Unsupported Media Type. Expecting application/json." }), {
            status: 415,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const data = await request.json() as SavePublishedPostBody;
        const { slug, frontmatter, body } = data;

        if (!slug || typeof slug !== 'string') {
            return new Response(JSON.stringify({ message: 'Slug is required and must be a string.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // Add similar validation for frontmatter and body as in save-draft.ts if desired

        const blogDir = path.join(process.cwd(), "src/content/blog");
        const safeSlug = path.basename(slug); // Basic sanitization

        // Find the existing file (it could be .md or .mdx)
        let filePath: string | null = null;
        const possibleExtensions = ['.md', '.mdx'];
        for (const ext of possibleExtensions) {
            const testPath = path.join(blogDir, `${safeSlug}${ext}`);
            try {
                await fs.access(testPath);
                filePath = testPath;
                break;
            } catch {
                // File not found with this extension, try next
            }
        }

        if (!filePath) {
            return new Response(JSON.stringify({ message: `Published post with slug '${safeSlug}' not found.` }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Update frontmatter
        const updatedFrontmatter = { ...frontmatter };
        updatedFrontmatter.updatedDate = new Date().toISOString(); // Update the last modified date

        // Ensure 'draft' status is not inadvertently re-introduced if it was removed or managed elsewhere
        // For published posts, 'draft' should typically be false or absent.
        // If your schema expects `draft: false` for published posts, ensure it's set.
        // If `draft` being absent means it's published, then `delete updatedFrontmatter.draft;` might be appropriate.
        // Based on content/config.ts, draft is optional and defaults to false if not present.
        // So, explicitly setting it to false or removing it would be consistent for a published post.
        // Let's ensure it's not true. If it exists and is true, make it false.
        if (updatedFrontmatter.hasOwnProperty('draft')) {
            updatedFrontmatter.draft = false;
        }


        // Reconstruct the file content
        let newContent = "";
        if (Object.keys(updatedFrontmatter).length > 0) {
            newContent += `---
${yaml.dump(updatedFrontmatter)}---

`;
        }
        newContent += body;

        await fs.writeFile(filePath, newContent, "utf-8");

        return new Response(JSON.stringify({ message: `Published post '${safeSlug}' updated successfully.` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("API Error updating published post:", error);
        let errorMessage = "Error processing request to update published post.";
        if (error instanceof yaml.YAMLException) {
            errorMessage = "Error serializing frontmatter to YAML for published post.";
        }
        return new Response(JSON.stringify({ message: errorMessage, error: error.message || 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}; 