import type { Todo } from '../todos/types'
import { TodoItem } from './TodoItem'
import styles from './TodoList.module.css'

type Props = {
  todos: Todo[]
  allCompleted: boolean
  onToggleAll: () => void
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onRemove: (id: string) => void
}

export function TodoList({ todos, allCompleted, onToggleAll, onToggle, onEdit, onRemove }: Props) {
  return (
    <section>
      <label className={styles.toggleAll}>
        <input type="checkbox" checked={allCompleted} onChange={onToggleAll} />
        Mark all complete
      </label>
      <ul className={styles.list}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  )
}
