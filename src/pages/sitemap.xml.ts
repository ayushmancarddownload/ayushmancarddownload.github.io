import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PAGE_SIZE, absUrl } from '../config';
import { slugifyCategory } from '../utils/slugify';
import { getHomeListing, getPublishedPosts, pageUrl } from '../utils/posts';

type Entry = { loc: string; lastmod?: string };

const totalPagesFor = (n: number) => Math.max(1, Math.ceil(n / PAGE_SIZE));
const day = (d: Date) => d.toISOString().slice(0, 10);

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const { rest } = await getHomeListing();
  const authors = await getCollection('authors');
  const latest = posts[0] ? day(posts[0].data.updatedDate ?? posts[0].data.pubDate) : undefined;

  const entries: Entry[] = [];

  // Home feed: /, /page/2/, ...
  for (let i = 1; i <= totalPagesFor(rest.length); i++) entries.push({ loc: pageUrl('/', i), lastmod: latest });

  // Blog archive: /blog/, /blog/page/2/, ...
  for (let i = 1; i <= totalPagesFor(posts.length); i++) entries.push({ loc: pageUrl('/blog/', i), lastmod: latest });

  // Categories (+ their pages)
  const categories = [...new Set(posts.map((p) => p.data.category))];
  for (const cat of categories) {
    const inCat = posts.filter((p) => p.data.category === cat);
    const base = `/blog/category/${slugifyCategory(cat)}/`;
    const lastmod = day(inCat[0].data.updatedDate ?? inCat[0].data.pubDate);
    for (let i = 1; i <= totalPagesFor(inCat.length); i++) entries.push({ loc: pageUrl(base, i), lastmod });
  }

  // Posts
  for (const p of posts) {
    entries.push({ loc: `/blog/${p.slug}/`, lastmod: day(p.data.updatedDate ?? p.data.pubDate) });
  }

  // Authors + static pages
  for (const a of authors) entries.push({ loc: `/author/${a.slug}/` });
  for (const path of ['editorial-team', 'about', 'contact', 'editorial-policy', 'privacy-policy', 'terms', 'disclaimer']) {
    entries.push({ loc: `/${path}/` });
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map((e) => `  <url><loc>${absUrl(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
