import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import rehypeAutoInternalLinks from './src/plugins/rehype-auto-internal-links.mjs';

export default defineConfig({
  site: 'https://postbnao.com',
  // Every URL (canonical, sitemap, internal links, pagination) uses a trailing slash,
  // matching how static hosts serve /folder/index.html.
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    // Automatic internal links between posts (see src/plugins/rehype-auto-internal-links.mjs)
    rehypePlugins: [[rehypeAutoInternalLinks, { maxLinks: 4 }]],
    shikiConfig: {
      // Light + dark code colours; global.css switches between them with the .dark class.
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
