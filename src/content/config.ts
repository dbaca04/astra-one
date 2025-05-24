import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string().min(1, "Title cannot be empty"),
        description: z.string().min(1, "Description cannot be empty"),
        date: z.coerce.date(),
        author: z.literal("Domdhi"),
        category: z.enum(["Code", "Create", "Automate", "Journal"]),
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string()
            .regex(/^\/images\/.+$/, "Hero image must be a path starting with /images/")
            .optional(),
        tags: z.array(z.string().min(1, "Tags cannot be empty strings")).optional(),
        slug: z.string().optional(),
        draft: z.boolean().optional().default(false),
    }),
});

export const collections = {
    'blog': blogCollection,
}; 