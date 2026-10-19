import { describe, expect, it } from 'vitest'
import { todosReducer } from './todosReducer'
import type { Todo } from './types'

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'a',
  title: 'Buy milk',
  completed: false,
  createdAt: 1,
  ...overrides,
})

describe('todosReducer', () => {
  describe('add', () => {
    it('appends a new active todo with a trimmed title', () => {
      const existing = makeTodo({ id: 'x', title: 'Existing' })
      const state = todosReducer([existing], {
        type: 'add',
        id: 'b',
        title: '  Buy milk  ',
        createdAt: 42,
      })
      expect(state).toEqual([
        existing,
        { id: 'b', title: 'Buy milk', completed: false, createdAt: 42 },
      ])
    })

    it('ignores a blank title', () => {
      const state = [makeTodo()]
      expect(todosReducer(state, { type: 'add', id: 'b', title: '   ', createdAt: 2 })).toBe(state)
    })
  })

  describe('toggle', () => {
    it('flips completed for the matching todo only', () => {
      const state = [makeTodo({ id: 'a' }), makeTodo({ id: 'b' })]
      const next = todosReducer(state, { type: 'toggle', id: 'a' })
      expect(next.map((t) => t.completed)).toEqual([true, false])
      expect(todosReducer(next, { type: 'toggle', id: 'a' })[0].completed).toBe(false)
    })
  })

  describe('edit', () => {
    it('sets the trimmed title', () => {
      const next = todosReducer([makeTodo()], { type: 'edit', id: 'a', title: '  Buy oat milk ' })
      expect(next[0].title).toBe('Buy oat milk')
    })

    it('removes the todo when the title is blank', () => {
      const next = todosReducer([makeTodo(), makeTodo({ id: 'b' })], {
        type: 'edit',
        id: 'a',
        title: '  ',
      })
      expect(next.map((t) => t.id)).toEqual(['b'])
    })
  })

  describe('remove', () => {
    it('removes the matching todo', () => {
      const next = todosReducer([makeTodo(), makeTodo({ id: 'b' })], { type: 'remove', id: 'a' })
      expect(next.map((t) => t.id)).toEqual(['b'])
    })
  })

  describe('toggleAll', () => {
    it('completes every todo when any is active', () => {
      const state = [makeTodo({ id: 'a', completed: true }), makeTodo({ id: 'b' })]
      expect(todosReducer(state, { type: 'toggleAll' }).every((t) => t.completed)).toBe(true)
    })

    it('reactivates every todo when all are completed', () => {
      const state = [makeTodo({ id: 'a', completed: true }), makeTodo({ id: 'b', completed: true })]
      expect(todosReducer(state, { type: 'toggleAll' }).every((t) => !t.completed)).toBe(true)
    })

    it('returns the same state for an empty list', () => {
      const state: Todo[] = []
      expect(todosReducer(state, { type: 'toggleAll' })).toBe(state)
    })
  })

  describe('clearCompleted', () => {
    it('keeps only active todos', () => {
      const state = [makeTodo({ id: 'a', completed: true }), makeTodo({ id: 'b' })]
      expect(todosReducer(state, { type: 'clearCompleted' }).map((t) => t.id)).toEqual(['b'])
    })
  })

  describe('unknown ids', () => {
    it.each([
      { type: 'toggle', id: 'nope' },
      { type: 'edit', id: 'nope', title: 'X' },
      { type: 'remove', id: 'nope' },
    ] as const)('$type leaves state unchanged', (action) => {
      const state = [makeTodo()]
      expect(todosReducer(state, action)).toEqual(state)
    })
  })
})
