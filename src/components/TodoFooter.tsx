import type { Filter } from '../todos/types'
import styles from './TodoFooter.module.css'

type Props = {
  activeCount: number
  hasCompleted: boolean
  filter: Filter
  onFilterChange: (filter: Filter) => void
  onClearCompleted: () => void
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export function TodoFooter({
  activeCount,
  hasCompleted,
  filter,
  onFilterChange,
  onClearCompleted,
}: Props) {
  return (
    <footer className={styles.footer}>
      <span className={styles.count} aria-live="polite">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>
      <div className={styles.filters} role="group" aria-label="Filter todos">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={styles.filter}
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {hasCompleted && (
        <button type="button" className={styles.clear} onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  )
}
