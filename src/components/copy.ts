export function itemsLeft(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'} left`
}
