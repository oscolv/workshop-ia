import { describe, it, expect } from 'vitest'
import { tools } from './tools'
import { listPages } from './wiki'

// Tests estructurales: válidos para cualquier wiki que siga el contrato,
// no solo para el seed. Ver nota en lib/wiki.test.ts.

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
  it('listar_paginas devuelve las 4 categorías y cubre todas las páginas', async () => {
    const result = await run(tools.listar_paginas.execute!({}, {} as never))
    expect(result).toHaveProperty('entidades')
    expect(result).toHaveProperty('conceptos')
    expect(result).toHaveProperty('fuentes')
    expect(result).toHaveProperty('respuestas')
    const total =
      result.entidades.length + result.conceptos.length +
      result.fuentes.length + result.respuestas.length
    expect(total).toBe(listPages().length)
  })

  it('leer_pagina devuelve frontmatter + body para una página existente', async () => {
    const slug = listPages()[0].slug
    const result = await run(tools.leer_pagina.execute!({ slug }, {} as never))
    if (result.error !== undefined) throw new Error('no debía dar error')
    expect(result.frontmatter!.titulo).toBeTruthy()
    expect(typeof result.body).toBe('string')
  })

  it('leer_pagina de slug inexistente devuelve error', async () => {
    const result = await run(tools.leer_pagina.execute!({ slug: 'noexiste' }, {} as never))
    expect(result).toHaveProperty('error')
  })

  it('buscar por título de una página existente la incluye en los resultados', async () => {
    const page = listPages().find(p => p.frontmatter.titulo.length > 3)!
    const result = await run(tools.buscar.execute!({ query: page.frontmatter.titulo }, {} as never))
    expect(result.length).toBeGreaterThan(0)
    expect(result.map(r => r.slug)).toContain(page.slug)
  })
})
