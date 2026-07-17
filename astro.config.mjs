import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// IMPORTANTE: base: '/blog' faz este projeto se comportar como se vivesse
// dentro de picgrade.app/blog — isso é o que permite o rewrite no projeto
// "app" funcionar sem quebrar links internos, imagens ou o sitemap.
// Veja README.md para o passo a passo do rewrite.
export default defineConfig({
  site: 'https://picgrade.app',
  base: '/blog',
  trailingSlash: 'never',
  integrations: [sitemap()],
});
