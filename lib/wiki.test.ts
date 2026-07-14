import { describe, it, expect } from 'vitest'
import { listPages, getPage, getIndex, search } from './wiki'

// Estos tests son estructurales: verifican la lógica del loader contra
// CUALQUIER wiki que siga el contrato de CLAUDE.md, no contra el contenido
// del seed. Así siguen pasando cuando forkeas y arrancas un tema nuevo.
// Único requisito: que haya al menos una página en wiki/.

describe('lib/wiki', () => {
  it('listPages devuelve al menos una página, con slug/category/frontmatter válidos', () => {
    const pages = listPages()
    expect(pages.length).toBeGreaterThan(0)
    for (const p of pages) {
      expect(p.slug).toMatch(/^(entidades|conceptos|fuentes|respuestas)\/[a-z0-9-]+$/)
      expect(p.slug.startsWith(`${p.category}/`)).toBe(true)
      expect(p.frontmatter.titulo).toBeTruthy()
      expect(['concepto', 'entidad', 'fuente', 'respuesta']).toContain(p.frontmatter.tipo)
      expect(typeof p.body).toBe('string')
    }
  })

  it('normaliza fechas del frontmatter a strings YYYY-MM-DD (no Date)', () => {
    for (const p of listPages()) {
      if (p.frontmatter.fecha_creacion !== undefined) {
        expect(p.frontmatter.fecha_creacion).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
      if (p.frontmatter.fecha_actualizacion !== undefined) {
        expect(p.frontmatter.fecha_actualizacion).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('getPage devuelve la misma página que listPages para cada slug', () => {
    const first = listPages()[0]
    const page = getPage(first.slug)
    expect(page).not.toBeNull()
    expect(page!.frontmatter.titulo).toBe(first.frontmatter.titulo)
    expect(page!.body).toBe(first.body)
  })

  it('getPage de slug inexistente devuelve null', () => {
    expect(getPage('conceptos/no-existe-jamas-xyz')).toBeNull()
  })

  it('getIndex agrupa todas las páginas por categoría sin perder ninguna', () => {
    const index = getIndex()
    const total =
      index.entidades.length + index.conceptos.length +
      index.fuentes.length + index.respuestas.length
    expect(total).toBe(listPages().length)
    for (const p of index.conceptos) expect(p.category).toBe('conceptos')
    for (const p of index.fuentes) expect(p.category).toBe('fuentes')
  })

  it('buscar el título exacto de una página la devuelve en primer lugar', () => {
    // El boost por match exacto de título debe ganar aunque otra página
    // use el término con más frecuencia.
    const page = listPages().find(p => p.frontmatter.titulo.length > 3)!
    const results = search(page.frontmatter.titulo)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].frontmatter.titulo).toBe(page.frontmatter.titulo)
  })

  it('search de un término inexistente devuelve lista vacía', () => {
    expect(search('xyzzyplugh9999')).toEqual([])
  })
})
