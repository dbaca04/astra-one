import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ params, request }) => {
    try {
        const blogEntries = await getCollection('blog');

        if (!blogEntries || blogEntries.length === 0) {
            return new Response(JSON.stringify({ error: 'No blog posts found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const randomIndex = Math.floor(Math.random() * blogEntries.length);
        const randomPost = blogEntries[randomIndex];

        return new Response(JSON.stringify(randomPost), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching random post:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}; 