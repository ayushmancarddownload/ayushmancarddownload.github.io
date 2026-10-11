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
    // Shown first in the "Trending" lists. Set true on the posts you want to push.
    popular: z.boolean().default(false),
    // Optional FAQ -> shown at the end of the post and emitted as FAQPage schema.
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, authors };
