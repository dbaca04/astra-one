import type { APIRoute } from 'astro';
import fs from "node:fs/promises";
import path from "node:path";

export const prerender = false; // Ensure server-rendering for API behavior

interface RejectBody {
    filePath?: string; // Path relative to the project root, e.g., src/content/drafts/my-draft.md
}

// Placeholder for authentication - replace with actual auth logic from Task 49
async function isAuthenticated(request: Request): Promise<boolean> {
    // Example: Check for a session cookie or auth header
    // const session = request.headers.get('Authorization');
    // if (!session || session !== 'Bearer valid-admin-token') return false;
    console.warn("Authentication for /api/admin/content/reject is currently a placeholder. Implement actual checks!");
    return true; // Allow for now, REQUIRES ACTUAL IMPLEMENTATION
}

export const POST: APIRoute = async ({ request }) => {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
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
        const data = await request.json() as RejectBody;
        const relativeFilePath = data.filePath;

        if (!relativeFilePath || typeof relativeFilePath !== 'string') {
            return new Response(JSON.stringify({ message: 'filePath is required and must be a string.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Security: Ensure the filePath is within the 'src/content/drafts' directory
        const draftsDir = path.resolve(process.cwd(), "src/content/drafts");
        const fullFilePath = path.resolve(process.cwd(), relativeFilePath);

        if (!fullFilePath.startsWith(draftsDir + path.sep)) {
            return new Response(JSON.stringify({ message: 'Invalid filePath. Must be within the drafts directory.' }), {
                status: 403, // Forbidden
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Prevent path traversal by ensuring the final path is just a filename after draftsDir
        const filename = path.basename(fullFilePath);
        const secureFilePath = path.join(draftsDir, filename);

        if (fullFilePath !== secureFilePath) {
            return new Response(JSON.stringify({ message: 'Invalid filePath. Path traversal detected.' }), {
                status: 403, // Forbidden
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            await fs.access(secureFilePath); // Check if file exists before attempting to delete
        } catch (accessError) {
            return new Response(JSON.stringify({ message: `File not found at path: ${relativeFilePath}` }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await fs.unlink(secureFilePath);

        return new Response(JSON.stringify({ message: `Draft '${filename}' rejected and deleted successfully.` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("API Error rejecting draft:", error);
        let errorMessage = "Error processing request to reject draft.";
        // Note: fs.unlink errors might have specific codes e.g., EPERM for permissions
        return new Response(JSON.stringify({ message: errorMessage, error: error.message || 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}; 