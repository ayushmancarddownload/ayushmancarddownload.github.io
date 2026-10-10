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

// Posts per page for the home page, blog archive and category pages.
export const PAGE_SIZE = 10;

/** Make any path or URL absolute, always on the production domain. */
export function absUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, SITE.url).href;
}
