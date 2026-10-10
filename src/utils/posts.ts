import { getCollection } from 'astro:content';
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
