import type { Todo, TodoAction } from './types'

export function todosReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add': {
      const title = action.title.trim()
      if (!title) return state
      return [...state, { id: action.id, title, completed: false, createdAt: action.createdAt }]
    }
    case 'toggle':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
      )
    case 'edit': {
      const title = action.title.trim()
      if (!title) return state.filter((todo) => todo.id !== action.id)
      return state.map((todo) => (todo.id === action.id ? { ...todo, title } : todo))
    }
    case 'remove':
      return state.filter((todo) => todo.id !== action.id)
    case 'toggleAll': {
      if (state.length === 0) return state
      const completed = state.some((todo) => !todo.completed)
      return state.map((todo) => ({ ...todo, completed }))
    }
    case 'clearCompleted':
      return state.filter((todo) => !todo.completed)
  }
}
