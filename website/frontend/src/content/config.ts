import { defineCollection, z } from 'astro:content';

const comparisons = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const languages = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    icon: z.string(),
    color: z.string(),
    order: z.number(),
  }),
});

export const collections = { comparisons, languages };
