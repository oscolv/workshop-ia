import { describe, it, expect } from 'vitest'
import { listPages, getPage, getIndex, search } from './wiki'

describe('lib/wiki', () => {
  it('listPages devuelve las 16 páginas de contenido del seed (4 fuentes + 5 entidades + 7 conceptos)', () => {
    const pages = listPages()
    expect(pages.length).toBe(16)
  })

  it('getPage("conceptos/transformer") devuelve la página con frontmatter correcto', () => {
    const page = getPage('conceptos/transformer')
    expect(page).not.toBeNull()
    expect(page!.frontmatter.titulo).toBe('Transformer')
    expect(page!.frontmatter.tipo).toBe('concepto')
    expect(page!.frontmatter.fuentes).toContain('2017-vaswani-attention')
    expect(page!.frontmatter.fuentes).toContain('2018-alammar-illustrated-transformer')
    expect(page!.body).toContain('Arquitectura de red neuronal')
  })

  it('getPage de slug inexistente devuelve null', () => {
    expect(getPage('conceptos/no-existe')).toBeNull()
  })

  it('getIndex agrupa por categoría', () => {
    const index = getIndex()
    expect(index.conceptos.length).toBe(7)
    expect(index.fuentes.length).toBe(4)
    expect(index.entidades.length).toBe(5)
    expect(index.respuestas.length).toBe(0)
  })

  it('search("RAG") encuentra al menos rag.md', () => {
    const results = search('RAG')
    const slugs = results.map(p => p.slug)
    expect(slugs).toContain('conceptos/rag')
  })

  it('search("transformer") rankea transformer.md alto', () => {
    const results = search('transformer')
    expect(results[0].slug).toBe('conceptos/transformer')
  })
})
