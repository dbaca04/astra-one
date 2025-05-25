export const prerender = false;
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter'; // Library to parse frontmatter

interface RequestBody {
    filePath: string; // Relative path from src/content/drafts/
}

// Helper to securely join paths and ensure it stays within a base directory
const safeJoin = (base: string, ...paths: string[]): string | null => {
    const joinedPath = path.normalize(path.join(base, ...paths));
    if (!joinedPath.startsWith(path.normalize(base) + path.sep) && joinedPath !== path.normalize(base)) {
        // path.normalize(base) added for the case where base itself is requested
        console.warn(`Potential directory traversal attempt: base='${base}', joinedPath='${joinedPath}'`);
        return null; // Path is outside the base directory
    }
    return joinedPath;
};

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
        return new Response(JSON.stringify({ message: "Invalid Content-Type. Expected application/json" }), {
            status: 415,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const body = await request.json() as RequestBody;
        const { filePath: relativeDraftPath } = body;

        if (!relativeDraftPath || typeof relativeDraftPath !== 'string') {
            return new Response(JSON.stringify({ message: "Missing or invalid filePath in request body" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Basic sanitization: remove leading slashes if any, to prevent issues with path.join
        const cleanRelativeDraftPath = relativeDraftPath.replace(/^\/+/, '');

        const draftsDir = path.join(process.cwd(), "src/content/drafts");
        const publishedDir = path.join(process.cwd(), "src/content/blog");

        const absoluteDraftPath = safeJoin(draftsDir, cleanRelativeDraftPath);

        if (!absoluteDraftPath) {
            return new Response(JSON.stringify({ message: "Invalid filePath. Potential directory traversal." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        let fileContentString: string;
        try {
            fileContentString = await fs.readFile(absoluteDraftPath, 'utf-8');
        } catch (readError: any) {
            console.error(`Error reading draft file at ${absoluteDraftPath}:`, readError);
            if (readError.code === 'ENOENT') {
                return new Response(JSON.stringify({ message: `Draft file not found: ${cleanRelativeDraftPath}` }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" }
                });
            }
            return new Response(JSON.stringify({ message: `Error reading draft file: ${cleanRelativeDraftPath}` }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        let parsedMatter;
        try {
            parsedMatter = matter(fileContentString);
        } catch (parseError: any) {
            console.error(`Error parsing frontmatter for ${absoluteDraftPath}:`, parseError);
            return new Response(JSON.stringify({ message: `Error parsing frontmatter: ${parseError.message}` }), {
                status: 422, // Unprocessable Entity
                headers: { "Content-Type": "application/json" }
            });
        }
        const { content: markdownBody, data: frontmatterData } = parsedMatter;

        if (!frontmatterData || typeof frontmatterData !== 'object') {
            return new Response(JSON.stringify({ message: "Could not parse frontmatter or frontmatter is not an object." }), {
                status: 422,
                headers: { "Content-Type": "application/json" }
            });
        }

        frontmatterData.status = 'Published';
        frontmatterData.pubDate = new Date().toISOString();
        if (!frontmatterData.slug) {
            const title = frontmatterData.title || 'untitled';
            frontmatterData.slug = title.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        const slug = frontmatterData.slug as string;

        const newFileContent = matter.stringify(markdownBody, frontmatterData);
        const newFileName = `${slug}.md`;

        const absolutePublishedPath = safeJoin(publishedDir, newFileName);
        if (!absolutePublishedPath) {
            // This case should ideally not happen if slug generation is robust
            console.error('Failed to construct a safe published path. Slug: ', slug);
            return new Response(JSON.stringify({ message: "Error constructing published file path from slug." }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        try {
            await fs.mkdir(publishedDir, { recursive: true });
            await fs.writeFile(absolutePublishedPath, newFileContent, 'utf-8');
        } catch (writeError: any) {
            console.error(`Error writing published file to ${absolutePublishedPath}:`, writeError);
            return new Response(JSON.stringify({ message: "Failed to write approved post to published directory." }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        try {
            await fs.unlink(absoluteDraftPath);
        } catch (deleteError: any) {
            console.error(`Error deleting original draft file ${absoluteDraftPath}:`, deleteError);
            // Non-critical error, proceed with success response but log it.
        }

        return new Response(JSON.stringify({
            message: "Content approved and published successfully.",
            publishedPath: path.join('src/content/blog', newFileName) // Relative path for client
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Generic error processing approval request:", error);
        return new Response(JSON.stringify({ message: "Internal server error.", error: error.message || 'Unknown error' }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}; 