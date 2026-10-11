import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { PAGE_SIZE } from '../config';

export async function getPublishedPosts() {
  return (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/** Home page: up to 2 featured posts (page 1 only) + the paginated rest. */
export async function getHomeListing() {
  const all = await getPublishedPosts();
  const featured = all.filter((p) => p.data.isFeatured).slice(0, 2);
  const rest = all.filter((p) => !featured.includes(p));
  return { all, featured, rest };
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
  };
}

/** URL of page n under a base path like "/", "/blog/" or "/blog/category/x/". */
export function pageUrl(basePath: string, n: number): string {
  return n <= 1 ? basePath : `${basePath}page/${n}/`;
}

/** Static paths for pages 2..N (page 1 lives on the base route). */
export function extraPagePaths(total: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ params: { page: String(i + 2) } }));
}

type Post = CollectionEntry<'blog'>;

/** Related posts: same category weighs most, same language adds a little. */
export function getRelatedPosts(post: Post, all: Post[], limit = 3): Post[] {
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const score = (p.data.category === post.data.category ? 2 : 0) + (p.data.lang === post.data.lang ? 1 : 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .slice(0, limit)
    .map((x) => x.p);
}

/** Trending list: posts marked `popular: true` first, then featured, then newest. */
export function getPopularPosts(all: Post[], limit = 5, excludeSlug?: string): Post[] {
  const rank = (p: Post) => (p.data.popular ? 2 : 0) + (p.data.isFeatured ? 1 : 0);
  return all
    .filter((p) => p.slug !== excludeSlug)
    .sort((a, b) => rank(b) - rank(a) || b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, limit);
}

/** Newer / older neighbours in publish order (`all` must be newest-first). */
export function getAdjacentPosts(slug: string, all: Post[]) {
  const i = all.findIndex((p) => p.slug === slug);
  return {
    newer: i > 0 ? all[i - 1] : undefined,
    older: i >= 0 && i < all.length - 1 ? all[i + 1] : undefined,
  };
}
