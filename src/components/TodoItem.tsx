import { useRef, useState, type KeyboardEvent } from 'react'
import type { Todo } from '../todos/types'
import styles from './TodoItem.module.css'

type Props = {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onRemove: (id: string) => void
}

export function TodoItem({ todo, onToggle, onEdit, onRemove }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  // Set once an edit has been saved or cancelled, so the blur that follows
  // when the input unmounts doesn't act on it a second time.
  const finishedRef = useRef(false)

  const startEditing = () => {
    finishedRef.current = false
    setDraft(todo.title)
    setEditing(true)
  }

  const finish = (save: boolean) => {
    if (finishedRef.current) return
    finishedRef.current = true
    if (save) onEdit(todo.id, draft)
    setEditing(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) finish(true)
    else if (event.key === 'Escape') finish(false)
  }

  // Distinct keys make React mount a fresh <input> for editing instead of
  // reusing the checkbox node, so autoFocus applies.
  if (editing) {
    return (
      <li key="edit" className={styles.item}>
        <input
          className={styles.editInput}
          aria-label={`Edit "${todo.title}"`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => finish(true)}
          autoFocus
        />
      </li>
    )
  }

  return (
    <li key="view" className={styles.item}>
      <input
        type="checkbox"
        className={styles.checkbox}
        aria-label={`Mark "${todo.title}" complete`}
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span
        className={todo.completed ? `${styles.title} ${styles.completed}` : styles.title}
        onDoubleClick={startEditing}
      >
        {todo.title}
      </span>
      <button
        type="button"
        className={styles.action}
        aria-label={`Edit "${todo.title}"`}
        onClick={startEditing}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.action} ${styles.danger}`}
        aria-label={`Delete "${todo.title}"`}
        onClick={() => onRemove(todo.id)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </li>
  )
}
