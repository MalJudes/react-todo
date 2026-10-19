import { afterEach, describe, expect, it } from 'vitest'
import { createId } from './createId'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const original = Object.getOwnPropertyDescriptor(crypto, 'randomUUID')

afterEach(() => {
  if (original) Object.defineProperty(crypto, 'randomUUID', original)
  else delete (crypto as Partial<Crypto>).randomUUID
})

describe('createId', () => {
  it('returns a v4 UUID', () => {
    expect(createId()).toMatch(UUID)
  })

  it('still returns unique v4 UUIDs when randomUUID is unavailable (insecure context)', () => {
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })
    const ids = new Set(Array.from({ length: 100 }, createId))
    expect(ids.size).toBe(100)
    for (const id of ids) expect(id).toMatch(UUID)
  })
})
