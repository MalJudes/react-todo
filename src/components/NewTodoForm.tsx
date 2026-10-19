import { useState, type FormEvent, type KeyboardEvent, type Ref } from 'react'
import { isComposingEnter } from './keyboard'
import styles from './NewTodoForm.module.css'

type Props = {
  onAdd: (title: string) => void
  inputRef?: Ref<HTMLInputElement>
}

export function NewTodoForm({ onAdd, inputRef }: Props) {
  const [title, setTitle] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd(title)
    setTitle('')
  }

  // Enter that confirms an IME composition must not submit the form.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isComposingEnter(event)) event.preventDefault()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="new-todo" className="visually-hidden">
        New todo
      </label>
      <input
        id="new-todo"
        ref={inputRef}
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
