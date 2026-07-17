import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORIES = [
  'Correção de provas',
  'Avaliação da aprendizagem',
  'Elaboração de avaliações',
  'Banco de questões',
  'Tecnologia para professores',
  'Inteligência Artificial na educação',
  'Atualizações do PicGrade',
] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160, 'Mantenha a meta description até 160 caracteres para SEO.'),
    date: z.coerce.date(),
    author: z.string().default('Equipe PicGrade'),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
export { CATEGORIES };
