import { useState } from 'react'
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

  const activeCount = countActive(todos)

  return (
    <main className={styles.app}>
      <h1 className={styles.heading}>Todos</h1>
      <div className={styles.card}>
        <NewTodoForm onAdd={add} />
        {todos.length === 0 ? (
          <p className={styles.empty}>Nothing to do yet — add your first task above.</p>
        ) : (
          <>
            <TodoList
              todos={filterTodos(todos, filter)}
              allCompleted={activeCount === 0}
              onToggleAll={toggleAll}
              onToggle={toggle}
              onEdit={edit}
              onRemove={remove}
            />
            <TodoFooter
              activeCount={activeCount}
              hasCompleted={activeCount < todos.length}
              filter={filter}
              onFilterChange={setFilter}
              onClearCompleted={clearCompleted}
            />
          </>
        )}
      </div>
    </main>
  )
}
