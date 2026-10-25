// Auto-generated cover image (SVG) for every post that has no `coverImage` in its frontmatter.
// URL: /images/auto/<post-slug>.svg   -> built at deploy time, nothing to upload.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE } from '../../../config';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}

const PALETTES: [string, string][] = [
  ['#f97316', '#c2410c'], // orange
  ['#ea580c', '#9a3412'], // deep orange
  ['#f59e0b', '#b45309'], // amber
  ['#fb7185', '#be123c'], // rose
  ['#14b8a6', '#0f766e'], // teal
  ['#6366f1', '#4338ca'], // indigo
  ['#0ea5e9', '#0369a1'], // sky
  ['#22c55e', '#15803d'], // green
];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text: string, perLine: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= perLine) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function layoutTitle(title: string) {
  for (const size of [78, 66, 56, 48, 42]) {
    const perLine = Math.floor(1040 / (size * 0.6));
    const lines = wrap(title, perLine);
    if (lines.length <= 4 || size === 42) {
      const cut = lines.slice(0, 5);
      if (lines.length > 5) cut[4] = cut[4].replace(/.{0,2}$/, '') + '…';
      return { size, lines: cut };
    }
  }
  return { size: 42, lines: [title] };
}

export const GET: APIRoute = ({ props }) => {
  const { post } = props as { post: { slug: string; data: { title: string; category: string } } };
  const { title, category } = post.data;
  const [c1, c2] = PALETTES[hash(category) % PALETTES.length];
  const { size, lines } = layoutTitle(title);
  const lineH = Math.round(size * 1.28);
  const blockH = lines.length * lineH;
  const startY = Math.round(337 - blockH / 2 + size * 0.9);
  const font = "'Noto Sans Devanagari','Noto Sans','Segoe UI',Roboto,Arial,sans-serif";

  const text = lines
    .map((l, i) => `<tspan x="80" y="${startY + i * lineH}">${esc(l)}</tspan>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675" role="img" aria-label="${esc(title)}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="1200" height="675" fill="url(#g)"/>
<circle cx="1100" cy="90" r="230" fill="#fff" fill-opacity="0.08"/>
<circle cx="1180" cy="640" r="170" fill="#000" fill-opacity="0.08"/>
<rect x="80" y="64" width="${Math.min(520, 60 + category.length * 20)}" height="48" rx="24" fill="#fff" fill-opacity="0.2"/>
<text x="104" y="97" font-family="${font}" font-size="24" font-weight="700" fill="#fff" letter-spacing="1">${esc(category.toUpperCase().slice(0, 24))}</text>
<text font-family="${font}" font-size="${size}" font-weight="800" fill="#fff">${text}</text>
<text x="80" y="620" font-family="${font}" font-size="28" font-weight="600" fill="#fff" fill-opacity="0.9">${esc(SITE.name)}</text>
</svg>`;

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
