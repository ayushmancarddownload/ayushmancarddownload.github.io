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
  // No length limits and no mandatory fields (except title): missing values get safe defaults
  // so a post never fails to build because of its frontmatter.
  schema: z
    .object({
      title: z.coerce.string(),
      description: z.coerce.string().default(''),
      pubDate: z.coerce.date().default(() => new Date()),
      updatedDate: z.coerce.date().optional(),
      author: reference('authors').default('the-od-team'),
      coverImage: z.string().optional(), // leave out -> a cover is auto-generated from the title
      coverAlt: z.string().optional(),
      category: z.coerce.string().default('General'),
      lang: z.string().default('en'), // use 'hi' for Hindi posts
      isFeatured: z.boolean().default(false),
      // Shown first in the "Trending" lists. Set true on the posts you want to push.
      popular: z.boolean().default(false),
      // Optional FAQ -> shown at the end of the post and emitted as FAQPage schema.
      faq: z.array(z.object({ q: z.coerce.string(), a: z.coerce.string() })).default([]),
      draft: z.boolean().default(false),
    })
    .transform((d) => ({ ...d, coverAlt: d.coverAlt ?? d.title })),
});

export const collections = { blog, authors };
