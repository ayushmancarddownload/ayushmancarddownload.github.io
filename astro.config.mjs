import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

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
    shikiConfig: {
      // Light + dark code colours; global.css switches between them with the .dark class.
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
