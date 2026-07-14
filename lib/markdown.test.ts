import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { remarkWikilinks, remarkNormalizeCalloutTypes } from './markdown'

function process(input: string): string {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkWikilinks)
      .use(remarkStringify)
      .processSync(input)
  )
}

function processCallouts(input: string): string {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkNormalizeCalloutTypes)
      .use(remarkStringify)
      .processSync(input)
  )
}

describe('remarkWikilinks', () => {
  it('convierte [[conceptos/transformer]] en link a /wiki/conceptos/transformer', () => {
    const out = process('Ver [[conceptos/transformer]] para más.')
    expect(out).toContain('[conceptos/transformer](/wiki/conceptos/transformer)')
  })

  it('soporta alias [[slug|texto visible]]', () => {
    const out = process('Más en [[conceptos/rag|RAG]].')
    expect(out).toContain('[RAG](/wiki/conceptos/rag)')
  })

  it('deja texto sin wikilinks intacto', () => {
    const out = process('Sin links aquí.')
    expect(out.trim()).toBe('Sin links aquí.')
  })

  it('procesa múltiples wikilinks en una línea', () => {
    const out = process('[[conceptos/rag]] y [[conceptos/transformer]].')
    expect(out).toContain('/wiki/conceptos/rag')
    expect(out).toContain('/wiki/conceptos/transformer')
  })

  it('ignora wikilinks dentro de code blocks', () => {
    const out = process('```\n[[no-conviertas]]\n```')
    expect(out).toContain('[[no-conviertas]]')
    expect(out).not.toContain('/wiki/no-conviertas')
  })
})

describe('remarkNormalizeCalloutTypes', () => {
  // rehype-callouts solo reconoce tipos [\w-]+ — "contradicción" (con ó)
  // nunca matchea. Normalizamos el tipo a ASCII y preservamos el acento
  // como título visible.
  it('convierte [!contradicción] en [!contradiccion] con título Contradicción', () => {
    const out = processCallouts('> [!contradicción]\n> Fuente A dice X.')
    expect(out).toContain('[!contradiccion] Contradicción')
    expect(out).toContain('Fuente A dice X.')
  })

  it('respeta un título explícito', () => {
    const out = processCallouts('> [!contradicción] Sobre el cuello de botella\n> Texto.')
    expect(out).toContain('[!contradiccion] Sobre el cuello de botella')
    expect(out).not.toContain('[!contradiccion] Contradicción')
  })

  it('no toca tipos ya-ASCII', () => {
    const out = processCallouts('> [!warning]\n> Cuidado.')
    expect(out).toContain('[!warning]')
  })

  it('no toca blockquotes normales', () => {
    const out = processCallouts('> Una cita cualquiera.')
    expect(out.trim()).toBe('> Una cita cualquiera.')
  })
})
