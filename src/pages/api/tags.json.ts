import { getAllTags } from '../../utils/tags';

export async function GET() {
    const uniqueTags = await getAllTags();
    return new Response(JSON.stringify(uniqueTags), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
} 