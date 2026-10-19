# React Todo List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, accessible, well-tested TodoMVC-style React app as a portfolio piece.

**Architecture:** A pure reducer holds all todo logic; `useTodos` wraps it with `useReducer` and localStorage persistence; presentational components receive data and callbacks via props from `TodoApp`, which also owns the (non-persisted) filter.

**Tech Stack:** Vite, React, TypeScript (strict), CSS Modules, Vitest, React Testing Library, user-event, jsdom, ESLint.

**Spec:** `docs/superpowers/specs/2026-10-19-react-todo-design.md`

## Global Constraints

- No UI library and no state-management library.
- TypeScript strict mode; no `any`.
- localStorage key: `react-todo:v1`.
- IDs from `crypto.randomUUID()`.
- Accessible names (exact copy): `New todo`, `Mark "{title}" complete`, `Delete "{title}"`, `Edit "{title}"`, `Mark all complete`, `Clear completed`, filter buttons `All` / `Active` / `Completed`.
- Count copy: `1 item left`, `N items left` (including `0 items left`).
- Done = `npm run test`, `npm run lint`, `npm run build` all pass.
- Commits use the repo's configured identity and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Escape then blur while editing** — Escape cancels; the blur that follows when the input unmounts must not save the draft. Test in Task 4.
2. **IME composition Enter** — pressing Enter to confirm a composition (`event.nativeEvent.isComposing`) must not submit/save. Test in Task 4.
3. **Duplicate titles** — two todos titled "Milk" are independent; deleting one leaves the other. Test in Task 4.
4. **Very long unbroken titles** — must wrap inside the card, not overflow horizontally (`overflow-wrap: anywhere`). Manual check in Task 4 Step 7.
5. **Save failure** — `setItem` throwing (quota/disabled) must not crash; app keeps working in memory. Test in Task 2.

---

### Task 1: Scaffold, types, and reducer

**Files:**
- Create: project scaffold via `npm create vite@latest . -- --template react-ts` (then delete demo assets/CSS from `App.tsx`, `App.css`, `src/assets`)
- Modify: `vite.config.ts` (add `test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts', css: { modules: { classNameStrategy: 'non-scoped' } } }`), `package.json` (scripts `test: "vitest run"`, `test:watch: "vitest"`), `tsconfig.app.json` (add `"types": ["vitest/globals"]`)
- Create: `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`; `afterEach(() => localStorage.clear())`)
- Create: `src/todos/types.ts`, `src/todos/todosReducer.ts`
- Test: `src/todos/todosReducer.test.ts`
- Dev deps: `vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`

**Interfaces:**
- Produces:
  ```ts
  // types.ts
  export type Todo = { id: string; title: string; completed: boolean; createdAt: number };
  export type Filter = 'all' | 'active' | 'completed';
  export type TodoAction =
    | { type: 'add'; id: string; title: string; createdAt: number }
    | { type: 'toggle'; id: string }
    | { type: 'edit'; id: string; title: string }
    | { type: 'remove'; id: string }
    | { type: 'toggleAll' }
    | { type: 'clearCompleted' };
  // todosReducer.ts
  export function todosReducer(state: Todo[], action: TodoAction): Todo[];
  ```

- [ ] **Step 1: Scaffold and install** — run the Vite command, `npm install`, install dev deps, apply the config edits above. Verify `npm run build` succeeds.

- [ ] **Step 2: Write failing reducer tests** in `todosReducer.test.ts`:
  - `add` appends `{ id, title: 'Buy milk', completed: false, createdAt }` given title `'  Buy milk  '`
  - `add` with `'   '` returns the same state reference
  - `toggle` flips `completed` for the matching id only
  - `edit` sets trimmed title; `edit` with `'  '` removes the todo
  - `remove` removes the matching id
  - `toggleAll` with any active → all `completed: true`; with all completed → all `false`
  - `clearCompleted` keeps only active todos
  - `toggle`/`edit`/`remove` with unknown id return state equal to input

- [ ] **Step 3: Run** `npm run test` — Expected: FAIL (module not found).

- [ ] **Step 4: Implement** `types.ts` and `todosReducer` (immutable updates; `toggleAll` on empty list returns state).

- [ ] **Step 5: Run** `npm run test` and `npm run lint` — Expected: all PASS, no lint errors.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: scaffold app and add todos reducer"` (add a `.gitignore` check: `node_modules` and `dist` excluded — Vite template provides it).

---

### Task 2: Filters and storage

**Files:**
- Create: `src/todos/filters.ts`, `src/todos/storage.ts`
- Test: `src/todos/filters.test.ts`, `src/todos/storage.test.ts`

**Interfaces:**
- Consumes: `Todo`, `Filter` from Task 1
- Produces:
  ```ts
  export function filterTodos(todos: Todo[], filter: Filter): Todo[];
  export function countActive(todos: Todo[]): number;
  export const STORAGE_KEY = 'react-todo:v1';
  export function loadTodos(): Todo[];
  export function saveTodos(todos: Todo[]): void;
  ```

- [ ] **Step 1: Write failing tests.**
  - filters: `all` returns all; `active` only incomplete; `completed` only complete; `countActive` of 2 active + 1 done is `2`.
  - storage: `saveTodos` then `loadTodos` round-trips; missing key → `[]`; `'not json'` → `[]`; `'{"a":1}'` → `[]`; array with one valid todo and one `{ id: 1 }` → only the valid todo; `vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error() })` → `[]`; same for `setItem` → `saveTodos` does not throw.

- [ ] **Step 2: Run** `npm run test` — Expected: new tests FAIL.

- [ ] **Step 3: Implement.** `loadTodos` validates each entry with an `isTodo(value: unknown): value is Todo` type guard (string id, string title, boolean completed, number createdAt). Both storage functions wrap access in try/catch.

- [ ] **Step 4: Run** `npm run test` — Expected: PASS.

- [ ] **Step 5: Commit** — `git commit -m "feat: add todo filters and localStorage persistence"`

---

### Task 3: `useTodos` hook

**Files:**
- Create: `src/todos/useTodos.ts`
- Test: `src/todos/useTodos.test.ts`

**Interfaces:**
- Consumes: `todosReducer`, `loadTodos`, `saveTodos`
- Produces:
  ```ts
  export function useTodos(): {
    todos: Todo[];
    add: (title: string) => void;
    toggle: (id: string) => void;
    edit: (id: string, title: string) => void;
    remove: (id: string) => void;
    toggleAll: () => void;
    clearCompleted: () => void;
  };
  ```

- [ ] **Step 1: Write failing tests** with `renderHook`:
  - initial `todos` come from pre-seeded `localStorage[STORAGE_KEY]`
  - `act(() => add('Walk dog'))` → `todos[0].title === 'Walk dog'` and `JSON.parse(localStorage.getItem(STORAGE_KEY)!)` has length 1
  - callbacks keep identity across rerenders (`result.current.add` same before and after an `add`)

- [ ] **Step 2: Run** — Expected: FAIL.

- [ ] **Step 3: Implement** with `useReducer(todosReducer, undefined, loadTodos)`, `useEffect(() => saveTodos(todos), [todos])`, and `useCallback` for each action; `add` generates `crypto.randomUUID()` and `Date.now()`.

- [ ] **Step 4: Run** — Expected: PASS.

- [ ] **Step 5: Commit** — `git commit -m "feat: add useTodos hook"`

---

### Task 4: Components, styling, and app integration

**Files:**
- Create: `src/components/TodoApp.tsx`, `NewTodoForm.tsx`, `TodoList.tsx`, `TodoItem.tsx`, `TodoFooter.tsx`, and a `.module.css` for each
- Modify: `src/App.tsx` (render `<TodoApp />`), `src/index.css` (theme tokens), `index.html` (`<title>Todos</title>`)
- Test: `src/components/TodoApp.test.tsx`

**Interfaces:**
- Consumes: `useTodos`, `filterTodos`, `countActive`, `Todo`, `Filter`
- Produces (props):
  ```ts
  NewTodoForm: { onAdd: (title: string) => void }
  TodoList:    { todos: Todo[]; allCompleted: boolean; onToggleAll: () => void;
                 onToggle: (id: string) => void; onEdit: (id: string, title: string) => void;
                 onRemove: (id: string) => void }
  TodoItem:    { todo: Todo; onToggle; onEdit; onRemove }   // same callback types as above
  TodoFooter:  { activeCount: number; hasCompleted: boolean; filter: Filter;
                 onFilterChange: (f: Filter) => void; onClearCompleted: () => void }
  ```

- [ ] **Step 1: Write failing integration tests** in `TodoApp.test.tsx` using `userEvent.setup()` and role/label queries only:
  - empty state: no `list` role rendered; empty-state text visible
  - add: type `Buy milk{Enter}` into `New todo` → listitem with `Buy milk`; input cleared; `1 item left`
  - blank: `   {Enter}` adds nothing
  - complete: click `Mark "Buy milk" complete` → `0 items left`; `Clear completed` button appears
  - filters: with one active + one completed, `Active` shows only active and has `aria-pressed="true"`; `Completed` shows only completed; `All` shows both
  - edit via button: click `Edit "Buy milk"`, clear, type `Buy oat milk{Enter}` → title updated
  - edit via double-click title works the same
  - edit Escape: change text then `{Escape}` → original title kept, edit field gone (**Review Focus 1**)
  - edit empty: clear and `{Enter}` → todo removed
  - IME: `fireEvent.keyDown(input, { key: 'Enter', isComposing: true })` on new-todo and edit inputs does not submit/save (**Review Focus 2**)
  - duplicates: add `Milk` twice, delete the first → exactly one `Milk` remains (**Review Focus 3**)
  - toggle all: `Mark all complete` completes all; clicking again reactivates all
  - delete: `Delete "Buy milk"` removes it
  - clear completed removes only completed todos
  - plural: two active → `2 items left`
  - persistence: add a todo, `unmount()`, render again → todo still present

- [ ] **Step 2: Run** — Expected: FAIL.

- [ ] **Step 3: Implement components.** Notes that pin choices:
  - `NewTodoForm`: `<form>` with visually-hidden `<label>` `New todo`; submit handler calls `onAdd` and clears input; ignore `onKeyDown` Enter when `e.nativeEvent.isComposing`.
  - `TodoItem`: local `editing` state and `draft`. Edit input `autoFocus`, labeled `Edit "{title}"`. Enter saves (`onEdit`), Escape sets a `cancelledRef` then exits; `onBlur` saves only if not cancelled. Double-click on title and the Edit button both enter edit mode.
  - `TodoList`: renders `Mark all complete` checkbox (checked = `allCompleted`) above a `<ul>`.
  - `TodoFooter`: count in `<span aria-live="polite">`; filter `<button aria-pressed>`s; `Clear completed` only when `hasCompleted`.
  - `TodoApp`: `const [filter, setFilter] = useState<Filter>('all')`; hides list and footer when `todos.length === 0` and shows empty-state text `Nothing to do yet — add your first task above.`

- [ ] **Step 4: Run** `npm run test` — Expected: PASS.

- [ ] **Step 5: Style.** `index.css`: tokens on `:root` (`--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--danger`, `--focus`), dark overrides under `@media (prefers-color-scheme: dark)`, explicit `body` background, system font stack, `.visually-hidden` utility. Card max-width 560px, `margin-inline: 16px` on small screens. Completed title: `text-decoration: line-through; color: var(--muted)`. All controls get `:focus-visible` outline using `--focus`. Titles use `overflow-wrap: anywhere` (**Review Focus 4**).

- [ ] **Step 6: Run** `npm run test && npm run lint && npm run build` — Expected: all PASS.

- [ ] **Step 7: Manual check** with `npm run dev`: add a 200-char unbroken title → wraps inside the card; check light and dark mode; tab through all controls → focus visible; resize to 375px wide → no horizontal scroll.

- [ ] **Step 8: Commit** — `git commit -m "feat: add todo UI components and styling"`

---

### Task 5: README and final verification

**Files:**
- Create: `README.md`, `docs/screenshot.png`

- [ ] **Step 1: Capture screenshot** of the app with 3–4 todos (one completed) at ~800px wide, saved to `docs/screenshot.png`.

- [ ] **Step 2: Write `README.md`** with sections: title + one-line summary, screenshot, Features, Tech stack, Getting started (`npm install`, `npm run dev`), Scripts (`dev`, `build`, `test`, `lint`), Design decisions (pure reducer for testability; no state/UI libraries; localStorage with validation and graceful failure; accessibility choices), Project structure.

- [ ] **Step 3: Final verification** — run `npm run test && npm run lint && npm run build`. Expected: all PASS with zero warnings from lint.

- [ ] **Step 4: Commit** — `git commit -m "docs: add README with screenshot"`
