import type { KeyboardEvent } from 'react'

// True for an Enter that confirms an IME composition. Safari ends the
// composition before this keydown, so isComposing is false there and only
// keyCode 229 identifies it.
export function isComposingEnter(event: KeyboardEvent): boolean {
  return event.key === 'Enter' && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
}
