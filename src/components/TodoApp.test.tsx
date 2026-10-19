import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TodoApp } from './TodoApp'

function setup() {
  const user = userEvent.setup()
  const utils = render(<TodoApp />)
  const newTodo = () => screen.getByLabelText('New todo')
  const addTodo = async (title: string) => {
    await user.type(newTodo(), `${title}{Enter}`)
  }
  const titles = () => screen.queryAllByRole('listitem').map((li) => li.textContent)
  return { user, addTodo, newTodo, titles, ...utils }
}

describe('TodoApp', () => {
  it('shows an empty state and no list when there are no todos', () => {
    setup()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByText('Nothing to do yet — add your first task above.')).toBeInTheDocument()
  })

  it('adds a todo and clears the input', async () => {
    const { addTodo, newTodo } = setup()
    await addTodo('Buy milk')
    expect(screen.getByRole('listitem')).toHaveTextContent('Buy milk')
    expect(newTodo()).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent(/^1 item left$/)
  })

  it('ignores a blank title', async () => {
    const { addTodo } = setup()
    await addTodo('   ')
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('completes a todo and offers to clear completed', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    expect(screen.queryByRole('button', { name: 'Clear completed' })).not.toBeInTheDocument()
    await user.click(screen.getByLabelText('Mark "Buy milk" complete'))
    expect(screen.getByRole('status')).toHaveTextContent(/^0 items left$/)
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeInTheDocument()
  })

  it('filters by active and completed', async () => {
    const { user, addTodo, titles } = setup()
    await addTodo('Active one')
    await addTodo('Done one')
    await user.click(screen.getByLabelText('Mark "Done one" complete'))

    const activeButton = screen.getByRole('button', { name: 'Active' })
    await user.click(activeButton)
    expect(activeButton).toHaveAttribute('aria-pressed', 'true')
    expect(titles()).toEqual([expect.stringContaining('Active one')])

    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(titles()).toEqual([expect.stringContaining('Done one')])

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(titles()).toHaveLength(2)
  })

  it('edits a todo via the edit button', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
    const input = screen.getByLabelText('Edit "Buy milk"')
    expect(input).toHaveFocus()
    await user.clear(input)
    await user.type(input, 'Buy oat milk{Enter}')
    expect(screen.getByRole('listitem')).toHaveTextContent('Buy oat milk')
    expect(screen.queryByRole('textbox', { name: /^Edit/ })).not.toBeInTheDocument()
  })

  it('edits a todo via double-clicking its title', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.dblClick(screen.getByText('Buy milk'))
    const input = screen.getByLabelText('Edit "Buy milk"')
    await user.clear(input)
    await user.type(input, 'Buy bread{Enter}')
    expect(screen.getByRole('listitem')).toHaveTextContent('Buy bread')
  })

  it('saves an edit on blur', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
    await user.type(screen.getByLabelText('Edit "Buy milk"'), ' today')
    await user.click(document.body)
    expect(screen.getByRole('listitem')).toHaveTextContent('Buy milk today')
  })

  it('cancels an edit with Escape without saving on the following blur', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
    await user.type(screen.getByLabelText('Edit "Buy milk"'), ' changed{Escape}')
    expect(screen.queryByRole('textbox', { name: /^Edit/ })).not.toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent('Buy milk')
    expect(screen.getByRole('listitem')).not.toHaveTextContent('changed')
  })

  it('deletes a todo when its title is edited to blank', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
    const input = screen.getByLabelText('Edit "Buy milk"')
    await user.clear(input)
    await user.type(input, '{Enter}')
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('does not add a todo on Enter during IME composition', () => {
    const { newTodo } = setup()
    fireEvent.change(newTodo(), { target: { value: 'にほん' } })
    fireEvent.keyDown(newTodo(), { key: 'Enter', isComposing: true })
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(newTodo()).toHaveValue('にほん')
  })

  it('does not save an edit on Enter during IME composition', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
    const input = screen.getByLabelText('Edit "Buy milk"')
    fireEvent.change(input, { target: { value: 'にほん' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(screen.getByLabelText('Edit "Buy milk"')).toBeInTheDocument()
  })

  it('keeps todos with duplicate titles independent', async () => {
    const { user, addTodo } = setup()
    await addTodo('Milk')
    await addTodo('Milk')
    await user.click(screen.getAllByRole('button', { name: 'Delete "Milk"' })[0])
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('listitem')).toHaveTextContent('Milk')
  })

  it('toggles all todos', async () => {
    const { user, addTodo } = setup()
    await addTodo('One')
    await addTodo('Two')
    const toggleAll = screen.getByLabelText('Mark all complete')
    await user.click(toggleAll)
    expect(screen.getByRole('status')).toHaveTextContent(/^0 items left$/)
    expect(toggleAll).toBeChecked()
    await user.click(toggleAll)
    expect(screen.getByRole('status')).toHaveTextContent(/^2 items left$/)
  })

  it('deletes a todo', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Delete "Buy milk"' }))
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('clears only completed todos', async () => {
    const { user, addTodo, titles } = setup()
    await addTodo('Keep')
    await addTodo('Drop')
    await user.click(screen.getByLabelText('Mark "Drop" complete'))
    await user.click(screen.getByRole('button', { name: 'Clear completed' }))
    expect(titles()).toEqual([expect.stringContaining('Keep')])
  })

  it('keeps a status region mounted so the first count is announced', async () => {
    const { addTodo } = setup()
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/^$/)
    await addTodo('One')
    expect(screen.getByRole('status')).toBe(status)
    expect(status).toHaveTextContent(/^1 item left$/)
  })

  it.each([
    ['Active', 'No active todos.'],
    ['Completed', 'No completed todos.'],
  ])('explains an empty %s filter', async (filterName, message) => {
    const { user, addTodo } = setup()
    await addTodo('One')
    if (filterName === 'Active') await user.click(screen.getByLabelText('Mark "One" complete'))
    await user.click(screen.getByRole('button', { name: filterName }))
    expect(screen.getByText(message)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.queryByText(message)).not.toBeInTheDocument()
  })

  it('labels toggle-all by what it will do', async () => {
    const { user, addTodo } = setup()
    await addTodo('One')
    await user.click(screen.getByLabelText('Mark all complete'))
    expect(screen.getByLabelText('Mark all active')).toBeChecked()
    await user.click(screen.getByLabelText('Mark all active'))
    expect(screen.getByLabelText('Mark all complete')).not.toBeChecked()
  })

  it('does not save a cancelled edit when the input blurs afterwards', async () => {
    const { user, addTodo } = setup()
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
    const input = screen.getByLabelText('Edit "Buy milk"')
    await user.type(input, ' changed')
    // Dispatch both inside one act() so the blur lands before React re-renders,
    // as it can when a browser fires blur while removing the focused input.
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    })
    expect(screen.getByRole('listitem')).not.toHaveTextContent('changed')
  })

  it('ignores Enter with keyCode 229 (Safari IME) on both inputs', async () => {
    const { user, addTodo, newTodo } = setup()
    fireEvent.change(newTodo(), { target: { value: 'にほん' } })
    fireEvent.keyDown(newTodo(), { key: 'Enter', keyCode: 229 })
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()

    await user.clear(newTodo())
    await addTodo('Buy milk')
    await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
    const input = screen.getByLabelText('Edit "Buy milk"')
    fireEvent.change(input, { target: { value: 'にほん' } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    expect(screen.getByLabelText('Edit "Buy milk"')).toBeInTheDocument()
  })

  describe('focus management', () => {
    it.each(['{Enter}', '{Escape}'])('returns focus to the Edit button after %s', async (key) => {
      const { user, addTodo } = setup()
      await addTodo('Buy milk')
      await user.click(screen.getByRole('button', { name: 'Edit "Buy milk"' }))
      await user.keyboard(key)
      expect(screen.getByRole('button', { name: 'Edit "Buy milk"' })).toHaveFocus()
    })

    it('moves focus to the next todo after deleting one', async () => {
      const { user, addTodo } = setup()
      await addTodo('One')
      await addTodo('Two')
      await user.click(screen.getByRole('button', { name: 'Delete "One"' }))
      expect(screen.getByLabelText('Mark "Two" complete')).toHaveFocus()
    })

    it('moves focus to the previous todo after deleting the last one', async () => {
      const { user, addTodo } = setup()
      await addTodo('One')
      await addTodo('Two')
      await user.click(screen.getByRole('button', { name: 'Delete "Two"' }))
      expect(screen.getByLabelText('Mark "One" complete')).toHaveFocus()
    })

    it('moves focus to the new todo input after deleting the only todo', async () => {
      const { user, addTodo, newTodo } = setup()
      await addTodo('One')
      await user.click(screen.getByRole('button', { name: 'Delete "One"' }))
      expect(newTodo()).toHaveFocus()
    })

    it('moves focus to a neighbour after editing a title to blank', async () => {
      const { user, addTodo } = setup()
      await addTodo('One')
      await addTodo('Two')
      await user.click(screen.getByRole('button', { name: 'Edit "One"' }))
      await user.clear(screen.getByLabelText('Edit "One"'))
      await user.keyboard('{Enter}')
      expect(screen.getByLabelText('Mark "Two" complete')).toHaveFocus()
    })

    it('moves focus to the new todo input after clearing completed', async () => {
      const { user, addTodo, newTodo } = setup()
      await addTodo('One')
      await user.click(screen.getByLabelText('Mark "One" complete'))
      await user.click(screen.getByRole('button', { name: 'Clear completed' }))
      expect(newTodo()).toHaveFocus()
    })
  })

  it('persists todos across remounts', async () => {
    const { addTodo, unmount } = setup()
    await addTodo('Remember me')
    unmount()
    render(<TodoApp />)
    const list = screen.getByRole('list')
    expect(within(list).getByText('Remember me')).toBeInTheDocument()
  })
})
