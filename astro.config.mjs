import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ayushmancarddownload.github.io', // or your custom domain
  integrations: [sitemap()],
});
