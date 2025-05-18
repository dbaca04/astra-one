import { defineCollection, z } from "astro:content";

const posts = defineCollection({
    type: 'content', // v2.5+ syntax
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        author: z.string(),
        category: z.string(),
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
        tags: z.array(z.string()).optional(),
        slug: z.string().optional(),
    }),
});

export const collections = { posts };

