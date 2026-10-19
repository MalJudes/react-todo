import { useCallback, useEffect, useReducer } from 'react'
import { createId } from './createId'
import { loadTodos, saveTodos } from './storage'
import { todosReducer } from './todosReducer'

export function useTodos() {
  const [todos, dispatch] = useReducer(todosReducer, undefined, loadTodos)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const add = useCallback((title: string) => {
    dispatch({ type: 'add', id: createId(), title, createdAt: Date.now() })
  }, [])
  const toggle = useCallback((id: string) => dispatch({ type: 'toggle', id }), [])
  const edit = useCallback((id: string, title: string) => dispatch({ type: 'edit', id, title }), [])
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), [])
  const toggleAll = useCallback(() => dispatch({ type: 'toggleAll' }), [])
  const clearCompleted = useCallback(() => dispatch({ type: 'clearCompleted' }), [])

  return { todos, add, toggle, edit, remove, toggleAll, clearCompleted }
}
