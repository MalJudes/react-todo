import { describe, expect, it } from 'vitest'
import { countActive, filterTodos } from './filters'
import type { Todo } from './types'

const todos: Todo[] = [
  { id: 'a', title: 'A', completed: false, createdAt: 1 },
  { id: 'b', title: 'B', completed: true, createdAt: 2 },
  { id: 'c', title: 'C', completed: false, createdAt: 3 },
]

describe('filterTodos', () => {
  it('returns every todo for "all"', () => {
    expect(filterTodos(todos, 'all').map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('returns only incomplete todos for "active"', () => {
    expect(filterTodos(todos, 'active').map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('returns only completed todos for "completed"', () => {
    expect(filterTodos(todos, 'completed').map((t) => t.id)).toEqual(['b'])
  })
})

describe('countActive', () => {
  it('counts incomplete todos', () => {
    expect(countActive(todos)).toBe(2)
  })
})
