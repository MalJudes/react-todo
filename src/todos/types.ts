export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export type Filter = 'all' | 'active' | 'completed'

export type TodoAction =
  | { type: 'add'; id: string; title: string; createdAt: number }
  | { type: 'toggle'; id: string }
  | { type: 'edit'; id: string; title: string }
  | { type: 'remove'; id: string }
  | { type: 'toggleAll' }
  | { type: 'clearCompleted' }
