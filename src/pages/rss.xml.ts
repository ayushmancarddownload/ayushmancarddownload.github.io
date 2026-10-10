import type { APIRoute } from 'astro';
import { SITE, absUrl } from '../config';
import { getPublishedPosts } from '../utils/posts';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const posts = (await getPublishedPosts()).slice(0, 50);
  const last = posts[0] ? (posts[0].data.updatedDate ?? posts[0].data.pubDate) : new Date();

  const items = posts
    .map((p) => {
      const url = absUrl(`/blog/${p.slug}/`);
      const cats = [p.data.category, ...p.data.tags].map((c) => `      <category>${esc(c)}</category>`).join('\n');
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
      <description>${esc(p.data.description)}</description>
${cats}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <description>${esc(SITE.tagline)}</description>
    <language>${SITE.defaultLang}</language>
    <lastBuildDate>${last.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
