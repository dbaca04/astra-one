import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();

    // Replace with actual environment variable fetching
    const envUsername = import.meta.env.ADMIN_USERNAME;
    const envPassword = import.meta.env.ADMIN_PASSWORD;

    if (username === envUsername && password === envPassword) {
        cookies.set('session', 'admin', {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD, // Use secure cookies in production
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        return redirect('/admin', 302);
    }
    return redirect('/admin/login?error=true', 302);
}; 