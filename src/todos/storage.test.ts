import { afterEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, loadTodos, saveTodos } from './storage'
import type { Todo } from './types'

const todo: Todo = { id: 'a', title: 'Buy milk', completed: false, createdAt: 1 }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('storage', () => {
  it('round-trips saved todos', () => {
    saveTodos([todo])
    expect(loadTodos()).toEqual([todo])
  })

  it('returns an empty list when nothing is saved', () => {
    expect(loadTodos()).toEqual([])
  })

  it('returns an empty list for corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    expect(loadTodos()).toEqual([])
  })

  it('returns an empty list when the saved value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, '{"a":1}')
    expect(loadTodos()).toEqual([])
  })

  it('drops invalid entries', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([todo, { id: 1 }]))
    expect(loadTodos()).toEqual([todo])
  })

  it('returns an empty list when reading storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(loadTodos()).toEqual([])
  })

  it('does not throw when writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => saveTodos([todo])).not.toThrow()
  })
})
