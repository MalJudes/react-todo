import { useState, type FormEvent, type KeyboardEvent } from 'react'
import styles from './NewTodoForm.module.css'

type Props = {
  onAdd: (title: string) => void
}

export function NewTodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd(title)
    setTitle('')
  }

  // Enter that confirms an IME composition must not submit the form.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="new-todo" className="visually-hidden">
        New todo
      </label>
      <input
        id="new-todo"
        className={styles.input}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        autoComplete="off"
        autoFocus
      />
    </form>
  )
}
