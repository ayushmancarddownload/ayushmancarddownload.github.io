// Single source of truth for site-wide values. Change the domain/brand here only.
export const SITE = {
  url: 'https://postbnao.com',
  name: 'The Orange Desk',
  tagline: 'Practical Guides on Money, Tech, and Everyday Decisions',
  email: 'hello@postbnao.com',
  defaultLang: 'en',
  defaultOgImage: '/images/og-default.png',
  logo: '/images/logo.png',
};

// ---- Optional integrations. Leave a value empty ('') to keep that feature switched off. ----

/** Giscus comments (GitHub Discussions). Get the 4 values from https://giscus.app */
export const GISCUS = {
  repo: '', // e.g. 'your-username/your-repo'  (repo must be public, Discussions enabled)
  repoId: '', // e.g. 'R_kgDO...'
  category: 'Comments',
  categoryId: '', // e.g. 'DIC_kwDO...'
};

/** Analytics. Cloudflare Web Analytics is cookie-less and loads straight away; GA4 loads only after the visitor accepts cookies. */
export const ANALYTICS = {
  cloudflareToken: '', // Cloudflare dashboard -> Web Analytics -> your site -> token
  ga4Id: '', // e.g. 'G-XXXXXXXXXX'
};

/** IndexNow key. The file public/74a203ba34ee951b4fe6ce0f48786931.txt must contain exactly this key (already created). */
export const INDEXNOW_KEY = '74a203ba34ee951b4fe6ce0f48786931';


// Posts per page for the home page, blog archive and category pages.
export const PAGE_SIZE = 10;

/** Make any path or URL absolute, always on the production domain. */
export function absUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, SITE.url).href;
}
