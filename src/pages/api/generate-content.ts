export const prerender = false;
import type { APIRoute } from 'astro';

/**
 * API endpoint to generate blog content. Extend this logic as needed.
 */
export const post: APIRoute = async ({ request }) => {
  try {
    // Try to parse the request body
    let body: any = null;
    try {
      body = await request.json();
    } catch (err: any) {
      console.error('[generate-content] Error parsing request body as JSON:', err.message);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON in request body." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate that the 'topic' parameter exists and is a non-empty string
    if (!body || typeof body.topic !== 'string' || body.topic.trim() === '') {
      const errorMsg = "'topic' is required and must be a non-empty string.";
      console.error(`[generate-content] Invalid request: ${errorMsg}`, { receivedBody: body });
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { topic } = body;
    console.log(`[generate-content] Received request to generate content for topic: "${topic}"`);

    // TODO: Implement actual content generation logic using the 'topic'
    // For now, we'll just simulate success and echo the topic.

    // Placeholder for actual generation success
    console.log(`[generate-content] Successfully processed request for topic: "${topic}"`);
    return new Response(
      JSON.stringify({ success: true, message: `Content generation process started for topic: "${topic}".`, received_topic: topic }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[generate-content] Unhandled error in API endpoint:', err.message, err.stack);
    // Return error and stack for debugging
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Unknown error.', stack: err.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
