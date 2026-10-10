import { defineCollection, reference, z } from 'astro:content';

const authors = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(), // e.g. "Senior Editor", "Fact-Checker"
    bio: z.string(),
    avatar: z.string(),
    qualifications: z.array(z.string()).optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(70),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: reference('authors'),
    coverImage: z.string(),
    coverAlt: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    lang: z.string().default('en'), // use 'hi' for Hindi posts
    isFeatured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, authors };
