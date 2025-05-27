import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('image'); // 'image' is the expected field name from the frontend

        if (!file || typeof file === 'string' || file.size === 0) {
            return new Response(JSON.stringify({ error: 'No image file provided.' }), { status: 400 });
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return new Response(JSON.stringify({ error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` }), { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({ error: `File size (${file.size} bytes) exceeds limit of ${MAX_FILE_SIZE} bytes.` }), { status: 400 });
        }

        // Generate a unique filename
        const fileExtension = path.extname(file.name);
        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'images');
        const filePath = path.join(uploadDir, uniqueFilename);

        // Ensure the upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        // Save the file
        const buffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Construct public URL
        const publicUrl = `/images/${uniqueFilename}`;

        return new Response(JSON.stringify({ url: publicUrl }), { status: 200 });

    } catch (error: any) {
        console.error('Error uploading image:', error);
        return new Response(JSON.stringify({ error: 'Failed to upload image.', details: error.message }), { status: 500 });
    }
}; 