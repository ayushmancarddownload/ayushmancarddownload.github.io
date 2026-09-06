import { defineConfig } from "astro/config";

// PERFORMANCE NOTES (why this config helps hit 90+ on Lighthouse/CrUX):
// - output: "static"  -> pages are pre-rendered HTML at build time (fastest TTFB/LCP).
//   Game data is fetched from your JSON API at BUILD time (see src/lib/gamesApi.ts).
//   If your catalog changes often, rebuild on a schedule (cron / webhook) or switch
//   individual routes to `export const prerender = false` for on-demand SSR.
// - image.domains -> lets astro:assets optimize/resize remote thumbnails (WebP/AVIF,
//   correct width, lazy loading) instead of shipping the API's raw, oversized images.
// - prefetch -> Astro prefetches game-detail pages on hover/viewport so navigation
//   feels instant without any extra client JS you have to write.
// - compressHTML -> smaller HTML payload.
export default defineConfig({
  // This IS the special <username>.github.io repo, so it deploys straight
  // to the root domain — no `base` path needed.
  site: "https://ayushmancarddownload.github.io",
  output: "static",
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  image: {
    // Add every host your games/thumbnails are actually hosted on (the
    // external site where you host your game files + thumbnails), so
    // astro:assets is allowed to optimize those remote images.
    // Example: domains: ["yourgamehost.com", "cdn.yourgamehost.com"]
    domains: [
      "yourgamehost.com",
    ],
  },
  build: {
    inlineStylesheets: "auto",
  },
});
