import type { APIRoute } from 'astro';

export const prerender = false;

interface AISuggestBody {
    content: string;
    // Potentially add other fields like 'frontmatter' in the future
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
        const data = await request.json() as AISuggestBody;
        const { content } = data;

        if (typeof content !== 'string') {
            return new Response(JSON.stringify({ message: 'Content must be a string.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // --- AI Logic Placeholder --- 
        // In a real scenario, you would send the 'content' to an AI service here.
        // For this PoC, we'll return a hardcoded suggestion based on content length.
        let suggestion = "This looks like a good start!";
        if (content.length < 50) {
            suggestion = "Consider adding more detail to your content.";
        } else if (content.length > 500) {
            suggestion = "This is quite comprehensive! Maybe break it down into smaller sections?";
        } else if (content.toLowerCase().includes("astro")) {
            suggestion = "Great job mentioning Astro! Keep up the good work.";
        }
        // --- End AI Logic Placeholder ---

        return new Response(JSON.stringify({ suggestion: suggestion }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("API Error in AI Suggestion:", error);
        return new Response(JSON.stringify({ message: "Error processing AI suggestion.", error: error.message || 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}; 