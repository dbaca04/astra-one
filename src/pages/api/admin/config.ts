import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'scripts/ai-config.json');

export const POST: APIRoute = async ({ request }) => {
    if (request.headers.get("Content-Type") !== "application/json") {
        return new Response(JSON.stringify({ message: 'Content-Type must be application/json' }), {
            status: 415,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const data = await request.json();

        // Basic validation - ensure it's an object
        if (typeof data !== 'object' || data === null) {
            return new Response(JSON.stringify({ message: 'Invalid JSON data: Expected an object.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // TODO: Add more specific validation based on ai-config.json structure if needed

        await fs.writeFile(configPath, JSON.stringify(data, null, 4));
        return new Response(JSON.stringify({ message: 'Configuration saved successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error saving configuration:', error);
        return new Response(JSON.stringify({ message: 'Error saving configuration', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const ALL: APIRoute = ({ request }) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: `Method ${request.method} Not Allowed` }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Allow': 'POST' }
        });
    }
    // Should not reach here if POST is handled
    return new Response(null, { status: 404 });
}; 