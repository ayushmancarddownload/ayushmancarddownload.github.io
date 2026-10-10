# The Orange Desk — Astro + Tailwind Blog

A production-ready, AdSense-compliant blog built with Astro Content Collections and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

To build for production:

```bash
npm run build
npm run preview
```

## What's included

- **Content Collections** (`src/content/config.ts`) — strict Zod schemas for `blog` and `authors`, with `blog.author` as a typed reference to `authors`.
- **Responsive layout** (`src/layouts/BaseLayout.astro`) — sticky header, desktop nav, and a slide-out mobile drawer with a vanilla-JS toggle (no framework dependency), 48px minimum tap targets.
- **Blog layout** (`src/layouts/BlogLayout.astro`) — wraps articles with breadcrumbs and `prose prose-orange lg:prose-lg` typography.
- **Dynamic routes**:
  - `src/pages/blog/[...slug].astro` — renders markdown via `render(entry)`, includes Article JSON-LD, in-article ad slots, author box, and related posts.
  - `src/pages/author/[id].astro` — author profile with Person JSON-LD, qualifications, and their filtered article list.
- **AdSense mandatory pages** — `/about`, `/contact`, `/editorial-policy`, `/privacy-policy` (with AdSense/DART cookie clauses), `/terms`, `/disclaimer`.
- **`/editorial-team`** — E-E-A-T author showcase.
- **`public/ads.txt`** — placeholder ready for your real publisher ID.

## Before you deploy — replace these placeholders

1. **AdSense publisher ID**: search for `ca-pub-XXXXXXXXXXXXXXXX` (in `BaseLayout.astro` and `AdSlot.astro`) and `pub-0000000000000000` (in `public/ads.txt`) and replace with your real IDs.
2. **Ad slot IDs**: the `slotId` props on `AdSlot` in `[...slug].astro` (`1111111111`, `2222222222`) are placeholders — swap in real ad unit IDs from your AdSense account.
3. **Site URL**: already set to `https://postbnao.com`. To change the domain, brand name or email, edit `src/config.ts` and `site` in `astro.config.mjs`.
4. **Images**: this repo ships without binary image assets. Add real files at the paths referenced in the sample markdown (e.g. `public/images/authors/john-doe.jpg`, `public/images/posts/budget-guide-cover.jpg`) or update the frontmatter `avatar` / `coverImage` fields to point at your CDN.
5. **Contact form**: the form in `/contact` posts to `/api/contact`, which isn't implemented (Astro's static output has no server by default). Wire it to a form backend (e.g. Formspree, Netlify Forms) or add an Astro server endpoint if you deploy with an adapter.
6. **Legal pages**: the privacy/terms/disclaimer copy is a solid starting template but is not legal advice — have a lawyer review before publishing, especially the AdSense/DART cookie clauses and any jurisdiction-specific requirements.

## Deploying to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, which auto-builds and deploys on every push to `main`.

`public/CNAME` contains `postbnao.com`, so GitHub Pages serves the site on your custom domain (set the domain under Settings → Pages and enable HTTPS). No `base` path is needed — pages will be served at the root (e.g. `/blog`, not `/repo-name/blog`).

**One-time setup on GitHub:**
1. Push this project to the `1v1lolubg.github.io` repository, on the `main` branch.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch").
4. Push again (or re-run the workflow from the **Actions** tab) — your site will be live at `https://1v1lolubg.github.io/` a minute or two later.

If you ever rename the repo to something other than `1v1lolubg.github.io` (i.e. it becomes a project page, not a user page), you'll also need to add `base: '/your-repo-name'` in `astro.config.mjs`.

## Sitemap (optional)

`@astrojs/sitemap` was removed from this project — the version available at build time crashed with `Cannot read properties of undefined (reading 'reduce')` on GitHub Actions. If you want an auto-generated sitemap later, run `npm install @astrojs/sitemap@latest`, add it back to `integrations` in `astro.config.mjs`, and test a build locally first before pushing.

## Category filtering — fixed a static-site bug

The category pills used to link to `/blog?category=X`, reading `Astro.url.searchParams` to filter posts. That doesn't work on a static export (GitHub Pages, etc.) — the HTML is generated once at build time with no knowledge of query strings, so every visitor got the same unfiltered page no matter what the URL said.

This is now fixed with a real static route: `src/pages/blog/category/[category].astro` uses `getStaticPaths()` to pre-render one fully-baked HTML page per category (e.g. `/blog/category/personal-finance`), each already containing only that category's posts. All category pills (homepage, blog archive, article breadcrumbs) now link to these pages instead of a query string.

## Ads are currently disabled

Since AdSense isn't approved yet, all ad-related code has been removed for now:
- The `AdSlot` component and its two placements on the article page are gone.
- The AdSense loader script in `BaseLayout.astro` was removed (it was fetching a script with a fake publisher ID on every page load, which cost performance for zero benefit).
- `public/ads.txt` is still in the repo — it's harmless to leave; Google only reads it when it verifies your site, it doesn't load during normal page views.

**Once your AdSense account is approved**, here's what to add back:
1. In `BaseLayout.astro`, inside `<head>`, add back the loader script with your real publisher ID:
   ```html
   <script
     async
     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_REAL_ID"
     crossorigin="anonymous"></script>
   ```
2. Recreate an `AdSlot.astro` component (or copy one from AdSense's own ad unit code) and place it in `src/pages/blog/[...slug].astro` wherever you want an in-article ad.
3. Update `public/ads.txt` with your real publisher ID.

## Mobile PageSpeed score is low — why, and what I fixed

Two things in the original template were quietly hurting the Performance score, especially on mobile:

1. **The AdSense loader script had a placeholder client ID**, so every page load fetched and parsed it for zero benefit. This is now fully removed (see "Ads are currently disabled" above).
2. **Google Fonts were render-blocking** — the stylesheet `<link>` was blocking first paint until it downloaded. It now uses the preload-then-swap technique, so the page paints with a fallback font immediately and swaps in the real font once it arrives.

Once you add **real cover/avatar images**, make sure to:
- Keep them reasonably sized (a 1200px-wide JPG/WebP is plenty for a blog cover — don't upload 4000px camera originals).
- Prefer `.webp` over `.jpg`/`.png` where possible.
- Consider switching `<img>` tags to Astro's built-in `<Image />` component (`astro:assets`) for automatic resizing/optimization if you want to go further — that's a small refactor in `PostCard.astro`, `AuthorCard.astro`, and the article/author pages.

Re-run PageSpeed Insights after redeploying — if the score is still low, check the **Diagnostics** section on the report (it lists exactly which resource is slow) and share it for a more targeted fix.

## Adding a new post

Create a new `.md` file in `src/content/blog/`, matching the frontmatter shape in `sample-post.md`. The `author` field must match the filename (slug) of a file in `src/content/authors/`.

## Adding a new author

Create a new `.md` file in `src/content/authors/`, matching `john-doe.md`.

## Pagination (10 posts per page)

Controlled by `PAGE_SIZE` in `src/config.ts`. Pagination links only appear once there are more than 10 posts.

- Home: `/` → `/page/2/` → `/page/3/` … (up to 2 featured posts are shown on page 1 in addition to the 10)
- Blog archive: `/blog/` → `/blog/page/2/` …
- Category: `/blog/category/<slug>/` → `/blog/category/<slug>/page/2/` …

Every page has a self-referencing canonical plus `rel="prev"` / `rel="next"`, and all pages are listed in the sitemap.

## SEO setup for postbnao.com

- Canonical URLs, Open Graph/Twitter tags and JSON-LD all use `https://postbnao.com` (trailing-slash URLs everywhere).
- `/sitemap.xml` and `/robots.txt` are generated at build time (no extra dependency).
- Article + BreadcrumbList JSON-LD on posts; WebSite + Organization JSON-LD on the home page.
- Per-post `lang` frontmatter (`lang: "hi"` for Hindi posts) sets `<html lang>` and `og:locale`.
- `404.astro` is `noindex`.
- Add your own cover images under `public/images/posts/` and author photos under `public/images/authors/` — they are referenced by the posts but not shipped.

## Images & speed (Core Web Vitals)

You can keep adding normal JPG/PNG/WebP images (any size) under `public/images/` — e.g. `public/images/posts/my-post.jpg` and reference them in the post frontmatter as before.

On every `npm run build` (also on GitHub Actions) `scripts/optimize-images.mjs`:
- creates small WebP versions (480 / 800 / 1200px; avatars 96 / 224px) in `public/images/_opt/` (auto-generated, git-ignored),
- writes `src/data/image-manifest.json` (sizes + placeholder colour).

The `<Img />` component (`src/components/Img.astro`) then serves the right size per device with `srcset`, lazy loading, fixed width/height (no layout shift) and a colour placeholder. Only the first card / the post cover image loads eagerly with high priority (LCP). Use `<Img />` instead of `<img>` for any new image.

Other speed settings: fonts are self-hosted (no Google Fonts request) with the latin files preloaded, and CSS is inlined (no render-blocking stylesheet).
Tip: OG/social images (`og-*`, `logo*`) are never resized; keep them around 1200x630 and under ~300 KB.
