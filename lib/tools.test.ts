import { describe, it, expect } from 'vitest'
import { tools } from './tools'

// execute() en AI SDK v6 tipa su retorno como T | AsyncIterable<T> (tools
// que streamean). Las nuestras siempre devuelven el valor directo.
async function run<T>(p: PromiseLike<T | AsyncIterable<T>> | T | AsyncIterable<T>): Promise<T> {
  const r = await p
  if (r && typeof r === 'object' && Symbol.asyncIterator in r) {
    throw new Error('no se esperaba un resultado streaming')
  }
  return r as T
}

describe('lib/tools', () => {
  it('listar_paginas devuelve las 4 categorías', async () => {
    const result = await run(tools.listar_paginas.execute!({}, {} as never))
    expect(result).toHaveProperty('entidades')
    expect(result).toHaveProperty('conceptos')
    expect(result).toHaveProperty('fuentes')
    expect(result).toHaveProperty('respuestas')
    expect(result.conceptos.length).toBe(7)
  })

  it('leer_pagina("conceptos/transformer") devuelve frontmatter + body', async () => {
    const result = await run(tools.leer_pagina.execute!({ slug: 'conceptos/transformer' }, {} as never))
    if (result.error !== undefined) throw new Error('no debía dar error')
    expect(result.frontmatter!.titulo).toBe('Transformer')
    expect(result.body).toContain('Arquitectura')
  })

  it('leer_pagina("noexiste") devuelve error', async () => {
    const result = await run(tools.leer_pagina.execute!({ slug: 'noexiste' }, {} as never))
    expect(result).toHaveProperty('error')
  })

  it('buscar("RAG") devuelve resultados que incluyen conceptos/rag', async () => {
    const result = await run(tools.buscar.execute!({ query: 'RAG' }, {} as never))
    expect(result.length).toBeGreaterThan(0)
    expect(result.map(r => r.slug)).toContain('conceptos/rag')
  })
})
