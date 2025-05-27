export const prerender = false;

export async function GET({ redirect }) {
  return redirect('/admin/content', 307);
}

// This endpoint redirects /admin/content/edit to /admin/content
