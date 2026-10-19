import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from './storage'
import type { Todo } from './types'
import { useTodos } from './useTodos'

describe('useTodos', () => {
  it('starts with todos loaded from storage', () => {
    const saved: Todo[] = [{ id: 'a', title: 'Saved', completed: true, createdAt: 1 }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toEqual(saved)
  })

  it('adds a todo and persists it', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.add('Walk dog'))
    expect(result.current.todos[0].title).toBe('Walk dog')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1)
  })

  it('keeps callback identities stable across updates', () => {
    const { result } = renderHook(() => useTodos())
    const before = result.current
    act(() => result.current.add('Walk dog'))
    const after = result.current
    expect(after.add).toBe(before.add)
    expect(after.toggle).toBe(before.toggle)
    expect(after.edit).toBe(before.edit)
    expect(after.remove).toBe(before.remove)
    expect(after.toggleAll).toBe(before.toggleAll)
    expect(after.clearCompleted).toBe(before.clearCompleted)
  })
})
