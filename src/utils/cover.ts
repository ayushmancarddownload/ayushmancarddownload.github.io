import type { CollectionEntry } from 'astro:content';
import { SITE } from '../config';

type Post = CollectionEntry<'blog'>;

/** Cover shown on the site. If the post has no coverImage, an auto-generated one is used. */
export function coverOf(post: Post): string {
  return post.data.coverImage ?? `/images/auto/${post.slug}.svg`;
}

/** Image for og:image / schema. Social networks don't accept SVG, so fall back to the default PNG. */
export function ogCoverOf(post: Post): string {
  return post.data.coverImage ?? SITE.defaultOgImage;
}
