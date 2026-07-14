import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { cache } from 'react'

export type WikiCategory = 'entidades' | 'conceptos' | 'fuentes' | 'respuestas'

export type WikiFrontmatter = {
  titulo: string
  tipo: 'concepto' | 'entidad' | 'fuente' | 'respuesta'
  fecha_creacion?: string
  fecha_actualizacion?: string
  fuentes?: string[]
  tags?: string[]
  autores?: string[]
  url?: string
  fecha_publicacion?: string
  formato_original?: string
}

export type WikiPage = {
  slug: string
  category: WikiCategory
  frontmatter: WikiFrontmatter
  body: string
}

const WIKI_DIR = path.join(process.cwd(), 'wiki')
const CATEGORIES: WikiCategory[] = ['entidades', 'conceptos', 'fuentes', 'respuestas']

function readAllPages(): WikiPage[] {
  const pages: WikiPage[] = []
  for (const category of CATEGORIES) {
    const dir = path.join(WIKI_DIR, category)
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('.')) continue
      const fullPath = path.join(dir, file)
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const { data, content } = matter(raw)
      const slug = `${category}/${file.replace(/\.md$/, '')}`
      pages.push({
        slug,
        category,
        frontmatter: data as WikiFrontmatter,
        body: content.trimStart(),
      })
    }
  }
  return pages
}

export const listPages = cache((): WikiPage[] => readAllPages())

export const getPage = cache((slug: string): WikiPage | null => {
  return listPages().find(p => p.slug === slug) ?? null
})

export const getIndex = cache(() => {
  const pages = listPages()
  return {
    entidades:  pages.filter(p => p.category === 'entidades'),
    conceptos:  pages.filter(p => p.category === 'conceptos'),
    fuentes:    pages.filter(p => p.category === 'fuentes'),
    respuestas: pages.filter(p => p.category === 'respuestas'),
  }
})

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-záéíóúñü0-9]+/i).filter(t => t.length > 1)
}

export const search = cache((query: string): WikiPage[] => {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []
  const pages = listPages()

  const N = pages.length
  const df: Record<string, number> = {}
  const docTokens: string[][] = pages.map(p => {
    const tokens = tokenize(`${p.frontmatter.titulo} ${(p.frontmatter.tags ?? []).join(' ')} ${p.body}`)
    const unique = new Set(tokens)
    for (const t of unique) df[t] = (df[t] ?? 0) + 1
    return tokens
  })

  const avgdl = docTokens.reduce((s, d) => s + d.length, 0) / N
  const k1 = 1.5, b = 0.75

  const scored = pages.map((page, i) => {
    const tokens = docTokens[i]
    const tf: Record<string, number> = {}
    for (const t of tokens) tf[t] = (tf[t] ?? 0) + 1
    let score = 0
    for (const q of queryTokens) {
      const dfq = df[q] ?? 0
      if (dfq === 0) continue
      const idf = Math.log((N - dfq + 0.5) / (dfq + 0.5) + 1)
      const tfq = tf[q] ?? 0
      const denom = tfq + k1 * (1 - b + b * (tokens.length / avgdl))
      score += idf * (tfq * (k1 + 1)) / (denom || 1)
    }
    // Buscar el nombre exacto de una página debe devolverla primero,
    // aunque otra página use el término con más frecuencia.
    if (tokenize(page.frontmatter.titulo ?? '').join(' ') === queryTokens.join(' ')) {
      score *= 3
    }
    return { page, score }
  })

  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.page)
})
