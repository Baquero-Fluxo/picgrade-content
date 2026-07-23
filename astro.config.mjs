import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// As páginas já vivem fisicamente sob /blog (src/pages/blog/*), e todos os
// links internos são strings literais com /blog embutido — por isso NÃO
// definimos base: '/blog' aqui. Fazer isso duplicava o prefixo (/blog/blog)
// nas URLs canônicas, no og:url e no sitemap, já que o Astro soma o base
// por cima da rota que já inclui /blog. Veja README.md para o rewrite.
export default defineConfig({
  site: 'https://picgrade.app',
  trailingSlash: 'never',
  integrations: [sitemap()],
});
