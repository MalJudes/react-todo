import { useEffect, useRef, useState } from 'react'
import { countActive, filterTodos } from '../todos/filters'
import type { Filter } from '../todos/types'
import { useTodos } from '../todos/useTodos'
import styles from './TodoApp.module.css'
import { NewTodoForm } from './NewTodoForm'
import { TodoFooter } from './TodoFooter'
import { TodoList } from './TodoList'

export function TodoApp() {
  const { todos, add, toggle, edit, remove, toggleAll, clearCompleted } = useTodos()
  const [filter, setFilter] = useState<Filter>('all')
  const cardRef = useRef<HTMLDivElement>(null)
  const newTodoRef = useRef<HTMLInputElement>(null)
  // Where focus should go after a removal: a todo id, null for the new-todo
  // input, or undefined when nothing is pending.
  const focusAfterRemovalRef = useRef<string | null | undefined>(undefined)

  const activeCount = countActive(todos)
  const visibleTodos = filterTodos(todos, filter)

  const neighbourOf = (id: string) => {
    const index = visibleTodos.findIndex((todo) => todo.id === id)
    return (visibleTodos[index + 1] ?? visibleTodos[index - 1])?.id ?? null
  }

  const handleRemove = (id: string) => {
    focusAfterRemovalRef.current = neighbourOf(id)
    remove(id)
  }

  const handleEdit = (id: string, title: string) => {
    if (!title.trim()) focusAfterRemovalRef.current = neighbourOf(id)
    edit(id, title)
  }

  const handleClearCompleted = () => {
    focusAfterRemovalRef.current = null
    clearCompleted()
  }

  // Removing the focused control drops focus to <body>; move it somewhere
  // sensible, but never away from a control the user has since focused.
  useEffect(() => {
    const target = focusAfterRemovalRef.current
    if (target === undefined) return
    focusAfterRemovalRef.current = undefined
    if (document.activeElement !== document.body) return
    const rows = cardRef.current?.querySelectorAll<HTMLElement>('[data-todo-id]') ?? []
    const row = Array.from(rows).find((li) => li.dataset.todoId === target)
    const checkbox = row?.querySelector<HTMLInputElement>('input[type="checkbox"]')
    ;(checkbox ?? newTodoRef.current)?.focus()
  }, [todos])

  return (
    <main className={styles.app}>
      <h1 className={styles.heading}>Todos</h1>
      <div className={styles.card} ref={cardRef}>
        <NewTodoForm onAdd={add} inputRef={newTodoRef} />
        {todos.length === 0 ? (
          <p className={styles.empty}>Nothing to do yet — add your first task above.</p>
        ) : (
          <>
            <TodoList
              todos={visibleTodos}
              allCompleted={activeCount === 0}
              onToggleAll={toggleAll}
              onToggle={toggle}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
            <TodoFooter
              activeCount={activeCount}
              hasCompleted={activeCount < todos.length}
              filter={filter}
              onFilterChange={setFilter}
              onClearCompleted={handleClearCompleted}
            />
          </>
        )}
      </div>
    </main>
  )
}
