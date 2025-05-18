import { z } from "astro:content";

// Define the blog schema type
export const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    slug: z.string().optional(),
    section: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    image: z.string().optional(),
    heroImage: z.string().optional(),
});

// Export the inferred type
export type BlogSchema = z.infer<typeof blogSchema>; 