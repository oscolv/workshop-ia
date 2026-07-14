import { tool } from 'ai'
import { z } from 'zod'
import { getPage, search, getIndex } from './wiki'

export const tools = {
  listar_paginas: tool({
    description: 'Lista todas las páginas del wiki agrupadas por categoría (entidades, conceptos, fuentes, respuestas). Úsalo PRIMERO antes de cualquier otra tool, para entender qué hay disponible.',
    inputSchema: z.object({}),
    execute: async () => {
      const index = getIndex()
      return {
        entidades:  index.entidades.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo })),
        conceptos:  index.conceptos.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo, tags: p.frontmatter.tags })),
        fuentes:    index.fuentes.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo, autores: p.frontmatter.autores })),
        respuestas: index.respuestas.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo })),
      }
    },
  }),

  leer_pagina: tool({
    description: 'Lee el contenido completo de una página dado su slug. Ej: "conceptos/transformer", "fuentes/2017-vaswani-attention", "entidades/openai".',
    inputSchema: z.object({
      slug: z.string().describe('Slug de la página (categoría/nombre, ej. "conceptos/transformer")'),
    }),
    execute: async ({ slug }) => {
      const page = getPage(slug)
      if (!page) return { error: `No existe página con slug "${slug}". Usa listar_paginas para ver las disponibles.` } as const
      return { frontmatter: page.frontmatter, body: page.body }
    },
  }),

  buscar: tool({
    description: 'Busca en el wiki por texto (BM25 sobre títulos, tags y body). Útil para preguntas exploratorias antes de leer páginas específicas.',
    inputSchema: z.object({
      query: z.string().describe('Términos de búsqueda en español o inglés'),
    }),
    execute: async ({ query }) => {
      const results = search(query)
      return results.slice(0, 5).map(p => ({
        slug: p.slug,
        titulo: p.frontmatter.titulo,
        snippet: p.body.slice(0, 200),
      }))
    },
  }),
}
