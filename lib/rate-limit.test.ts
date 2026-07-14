import { describe, it, expect, beforeEach, vi } from 'vitest'
import { _resetForTest, rateLimit } from './rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    _resetForTest()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T12:00:00Z'))
  })

  it('permite hasta `limit` requests en la ventana', async () => {
    for (let i = 0; i < 3; i++) {
      expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(true)
    }
  })

  it('bloquea la (limit+1)-ésima request', async () => {
    for (let i = 0; i < 3; i++) await rateLimit('k', { limit: 3, windowSec: 60 })
    expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(false)
  })

  it('vuelve a permitir cuando la ventana expira', async () => {
    for (let i = 0; i < 3; i++) await rateLimit('k', { limit: 3, windowSec: 60 })
    expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(true)
  })

  it('keys distintas no interfieren', async () => {
    for (let i = 0; i < 3; i++) await rateLimit('a', { limit: 3, windowSec: 60 })
    expect(await rateLimit('a', { limit: 3, windowSec: 60 })).toBe(false)
    expect(await rateLimit('b', { limit: 3, windowSec: 60 })).toBe(true)
  })
})
