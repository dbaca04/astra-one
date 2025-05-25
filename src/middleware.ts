import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const { cookies, url, redirect } = context;

    // Allow access to login page and API routes
    if (url.pathname.startsWith('/admin/login') || url.pathname.startsWith('/api/')) {
        return next();
    }

    // Protect all other admin routes
    if (url.pathname.startsWith('/admin')) {
        const session = cookies.get('session');
        if (!session || session.value !== 'admin') {
            return redirect('/admin/login', 302);
        }
    }

    return next();
}); 