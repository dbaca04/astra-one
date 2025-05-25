export const prerender = false; // Ensures this API route is server-rendered
import type { APIRoute } from 'astro';
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

interface SaveDraftRequestBody {
    slug: string;
    frontmatter: Record<string, any>; // Or a more specific type if known
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

    if (request.headers.get("Content-Type") === "application/json") {
        try {
            const data = await request.json() as SaveDraftRequestBody;
            const { slug, frontmatter, body } = data;

            if (!slug || typeof slug !== 'string') {
                return new Response(JSON.stringify({ message: 'Slug is required and must be a string.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            if (!frontmatter || typeof frontmatter !== 'object') {
                return new Response(JSON.stringify({ message: 'Frontmatter is required and must be an object.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            if (typeof body !== 'string') { // body can be an empty string
                return new Response(JSON.stringify({ message: 'Body must be a string.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const draftsDir = path.join(process.cwd(), "src/content/drafts");
            // Ensure the slug does not contain path traversal characters for security
            const safeSlug = path.basename(slug);
            const filePath = path.join(draftsDir, `${safeSlug}.md`);

            // Reconstruct the file content
            let newContent = "";
            if (Object.keys(frontmatter).length > 0) {
                newContent += `---\n${yaml.dump(frontmatter)}---\n\n`;
            }
            newContent += body;

            await fs.writeFile(filePath, newContent, "utf-8");

            return new Response(JSON.stringify({ message: `Draft '${safeSlug}' saved successfully.` }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        } catch (error) {
            console.error("API Error saving draft:", error);
            let errorMessage = "Error processing request.";
            if (error.code === 'ENOENT') {
                errorMessage = "Draft file not found for writing. This should not happen if slug is validated.";
            } else if (error instanceof yaml.YAMLException) {
                errorMessage = "Error serializing frontmatter to YAML.";
            }
            return new Response(JSON.stringify({ message: errorMessage, error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }
    return new Response(JSON.stringify({ message: "Unsupported Media Type. Expecting application/json." }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
    });
}; 