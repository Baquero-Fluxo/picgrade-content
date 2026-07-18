# picgrade-content

Motor de conteúdo do PicGrade — Fase 1: Blog.

Astro + Content Collections. Markdown em `src/content/blog/`, tudo o mais é gerado.

## Rodar localmente

```bash
npm install
npm run dev
```

O blog fica disponível em `http://localhost:4321/blog` (o `base: '/blog'` no
`astro.config.mjs` já reproduz o path final de produção).

## Publicar um post novo

Criar um arquivo `.md` em `src/content/blog/` com este frontmatter:

```yaml
---
title: "Título do post"
description: "Até 160 caracteres — vira a meta description."
date: 2026-07-10
author: "Equipe PicGrade"
category: "Correção de provas"   # uma das 7 categorias fixas em src/content.config.ts
tags: ["tag1", "tag2"]
draft: false
---
```

Se a categoria não bater com uma das 7 já definidas, o build vai falhar —
isso é intencional: evita categoria nova criada sem querer.

## Deploy (Vercel)

1. Suba este repo pro GitHub.
2. Crie um **novo projeto Vercel** apontando pra esse repo (separado do projeto do app).
   Framework preset: Astro. Build command e output ficam automáticos.
3. Anote a URL do deploy (ex: `picgrade-content.vercel.app`).

## Estrutura de conteúdo

Os artigos do blog ficam na pasta `Artigos/` na raiz do repositório. Para publicar um
novo post, crie um arquivo Markdown em `Artigos/` com o frontmatter exigido pelo
schema (`title`, `description`, `date`, `author`, `category`, `tags`, `draft`).

Exemplo mínimo de frontmatter:

```yaml
---
title: "Título do post"
description: "Descrição para meta (até 160 chars)"
date: 2026-07-18
author: "Equipe PicGrade"
category: "Correção de provas"
tags: ["tag1", "tag2"]
draft: false
---
```

O processo de build do Astro já está configurado para ler `Artigos/` como fonte
dos posts — após adicionar um novo arquivo, faça commit e push; em seguida o
deploy no Vercel fará o build e publicará o post em `/blog/`.

## Conectar ao domínio principal (picgrade.app/blog)

Isso é o que faz `picgrade.app/blog` mostrar este projeto sem precisar de
subdomínio (subdomínio é pior pra SEO — a autoridade de domínio não se
propaga bem entre `blog.picgrade.app` e `picgrade.app`).

No **repositório do app** (não neste), adicione ao `vercel.json` o conteúdo
de `vercel-rewrite-example.json` deste projeto — trocando a URL de exemplo
pela URL real do seu deploy. Se o `vercel.json` do app já tiver uma chave
`rewrites`, junte os arrays em vez de sobrescrever.

Depois do deploy do app, `picgrade.app/blog` deve servir este projeto.

## Próximos passos (não incluídos ainda)

- FAQ e Docs (mesma arquitetura, coleções novas em `content.config.ts`)
- Schema.org (Article) nos posts
- Automação de geração de conteúdo por IA
