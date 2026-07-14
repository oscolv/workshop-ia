import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { remarkWikilinks } from './markdown'

function process(input: string): string {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkWikilinks)
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
