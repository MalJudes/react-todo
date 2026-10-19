# React Todo List — Design Spec

**Date:** 2026-10-19
**Status:** Approved in conversation, pending written-spec review

## Purpose

A portfolio/demo piece. Success means a reviewer opening the repo sees clean, typed,
well-tested, accessible React code, and opening the app sees a polished, responsive UI.
Scope is deliberately small (classic TodoMVC feature set) and executed to a high standard.

## Scope

### In scope
- Add a todo (Enter submits; titles trimmed; blank titles ignored)
- Toggle a todo complete/active
- Toggle all todos (if any are active, mark all complete; otherwise mark all active)
- Edit a todo title (double-click title, or Edit button / Enter on focused item)
  - Enter or blur saves; Escape cancels
  - Saving an empty (after trim) title deletes the todo
- Delete a todo
- Filter: All / Active / Completed
- Footer: "N item(s) left" count (active todos), filter buttons, "Clear completed"
  (hidden when no completed todos)
- Persistence to `localStorage`
- Automatic light/dark theme via `prefers-color-scheme`

### Out of scope
Backend, accounts/sync, drag-to-reorder, manual theme toggle, due dates, priorities, tags,
URL-based filter routing.

## Tech stack
- Vite + React + TypeScript (strict), versions as installed by the current `create-vite` react-ts template
- CSS Modules + CSS custom properties; no UI library, no state library
- Vitest + React Testing Library + @testing-library/user-event + jsdom
- ESLint (Vite React-TS template config)

## Data model

```ts
type Todo = { id: string; title: string; completed: boolean; createdAt: number };
type Filter = 'all' | 'active' | 'completed';
```

IDs come from `crypto.randomUUID()`, with a `getRandomValues`-based v4 UUID fallback where it is unavailable (plain-http, non-secure contexts).

## Architecture

```
src/
  todos/
    types.ts             # Todo, Filter, TodoAction types
    todosReducer.ts      # pure reducer
    filters.ts           # filterTodos(todos, filter), countActive(todos)
    storage.ts           # loadTodos(), saveTodos(todos)
    useTodos.ts          # useReducer + persistence effect; returns state + action callbacks
  components/
    TodoApp.tsx          # composition root; owns `filter` state
    NewTodoForm.tsx
    TodoList.tsx
    TodoItem.tsx
    TodoFooter.tsx
    *.module.css
  App.tsx
  main.tsx
  index.css              # theme tokens, base styles
```

### Reducer actions
| Action | Payload | Behavior |
|---|---|---|
| `add` | `title` | Trim; ignore if empty; append new todo (active) |
| `toggle` | `id` | Flip `completed` |
| `edit` | `id, title` | Trim; if empty, remove todo; else set title |
| `remove` | `id` | Remove todo |
| `toggleAll` | — | If any active → all completed; else all active |
| `clearCompleted` | — | Remove completed todos |

Unknown ids are no-ops. The reducer is pure: `id` and `createdAt` for `add` are
generated in `useTodos` and passed in the action, so the reducer is deterministic and
testable.

### `useTodos`
- Initializes state lazily from `loadTodos()`.
- `useEffect` calls `saveTodos(todos)` whenever `todos` changes.
- Returns `{ todos, add, toggle, edit, remove, toggleAll, clearCompleted }`, with
  callbacks stable via `useCallback`.

### `storage`
- Key: `react-todo:v1`.
- `loadTodos()` returns `[]` if the key is missing, JSON is invalid, the value is not an
  array of valid `Todo` shapes, or `localStorage` throws. Invalid entries are dropped.
- `saveTodos()` swallows storage errors (e.g., quota, disabled storage); the app keeps
  working in-memory.

### Data flow
Components are presentational: they receive data and callbacks via props. `TodoApp` calls
`useTodos()` and owns `filter` (not persisted). `TodoList` receives already-filtered todos.

## UI & styling
- Single centered card, max-width ~560px, 16px side gutter on small screens.
- Theme tokens on `:root` with a `prefers-color-scheme: dark` override.
- Completed todos: strikethrough + muted color.
- Subtle hover states; visible `:focus-visible` outlines on all controls.
- Empty state: when there are no todos, show a short prompt and hide the list and footer.
- Empty filter: when a filter matches nothing, show "No active todos." or "No completed todos."

## Accessibility
- `<form>` with a labeled input (visually hidden label "New todo").
- `<ul>`/`<li>` list; real `<input type="checkbox">` with accessible name
  `Mark "{title}" complete`; delete `<button>` named `Delete "{title}"`; edit button named
  `Edit "{title}"`.
- Edit field labeled `Edit "{title}"`, auto-focused when editing starts.
- Toggle-all checkbox labeled "Mark all complete", or "Mark all active" when every todo is complete.
- Filter buttons use `aria-pressed`.
- Items-left count announced through an always-mounted `role="status"` region (so the first count is announced); the visible count is `aria-hidden`.

## Testing
TDD: tests written before implementation for each unit.
- `todosReducer.test.ts` — every action, trimming, empty-title rules, unknown ids, toggleAll
  both directions.
- `filters.test.ts` — each filter, `countActive`.
- `storage.test.ts` — round-trip, missing key, corrupt JSON, non-array, invalid entries
  dropped, `getItem`/`setItem` throwing.
- `TodoApp.test.tsx` — user-level flow: add, complete, filter, edit (save / Escape / empty
  deletes), delete, toggle all, clear completed, singular/plural count, persistence across
  unmount and remount.

Scripts: `npm run dev`, `npm run build`, `npm run test`, `npm run lint`. Done means test,
lint and build all pass.

## Deliverables
- Working app per above
- `README.md`: summary, screenshot, stack, scripts, design decisions
