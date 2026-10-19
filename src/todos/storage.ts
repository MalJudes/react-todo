import type { Todo } from './types'

export const STORAGE_KEY = 'react-todo:v1'

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.completed === 'boolean' &&
    typeof v.createdAt === 'number'
  )
}

export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTodo) : []
  } catch {
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // Storage is full or unavailable; the app keeps working in memory.
  }
}
