import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(""),
    date: z.string(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    modified: z.string().optional(),
  }),
});

const misc = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/misc" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    published: z.boolean().default(true),
    description: z.string().optional().default(""),
  }),
});

export const collections = { blog, misc };
