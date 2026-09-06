import { defineConfig, passthroughImageService } from "astro/config";

// PERFORMANCE NOTES (why this config helps hit 90+ on Lighthouse/CrUX):
// - output: "static"  -> pages are pre-rendered HTML at build time (fastest TTFB/LCP).
//   Game data is fetched from your JSON API at BUILD time (see src/lib/gamesApi.ts).
//   If your catalog changes often, rebuild on a schedule (cron / webhook) or switch
//   individual routes to `export const prerender = false` for on-demand SSR.
// - image.service: passthroughImageService() -> your game thumbnails/hero images are
//   served as plain <img src="..."> at their ORIGINAL remote URL, with no build-time
//   fetch+resize+WebP step. This is on purpose: astro:assets' default image service
//   downloads every remote image with sharp DURING the build, so a single broken,
//   hotlink-protected, or momentarily-403ing thumbnail (like a demo/placeholder host
//   blocking GitHub Actions' IPs) fails the ENTIRE deploy. With passthrough, a bad
//   thumbnail just shows a broken image on that one card — it can never take down
//   the whole site's build. Trade-off: no automatic WebP/AVIF conversion or resizing
//   for these remote images, so pre-compress/resize your real thumbnails on your own
//   CDN before linking them here.
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
    service: passthroughImageService(),
  },
  build: {
    inlineStylesheets: "auto",
  },
});
