import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import List from './List'
import noteReducer from '../../reducers/noteReducer'
import sortReducer from '../../reducers/sortReducer'
import type { Note } from '@mystash/shared'

const defaultNote = {
  id: '1',
  userId: '1337',
  title: 'Test Note',
  content: 'This is a test note.',
  tags: ['test'],
  updatedAt: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
} satisfies Note

const buildNote = (overrides: Partial<Note>): Note => ({
  ...defaultNote,
  ...overrides,
})

const defaultFilter = {
  value: '',
  setFilter: vi.fn(),
  onChange: vi.fn(),
}

const renderList = (
  notes: Note[],
  {
    filter = defaultFilter,
    loading = false,
    sortNotes = 'MODIFIED',
  }: { filter?: any; loading?: boolean; sortNotes?: string } = {}
) => {
  const store = configureStore({
    reducer: {
      notes: noteReducer,
      sortNotes: sortReducer,
    },
    preloadedState: {
      notes,
      sortNotes,
    },
  })

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <List filter={filter} loading={loading} />
        </MemoryRouter>
      </Provider>
    ),
  }
}

describe('List', () => {
  test('renders the titles of the given notes', () => {
    renderList([
      buildNote({ id: '1', title: 'First note' }),
      buildNote({ id: '2', title: 'Second note' }),
    ])
    expect(screen.getByText('First note')).toBeInTheDocument()
    expect(screen.getByText('Second note')).toBeInTheDocument()
  })

  test('shows the empty state message when there are no notes', () => {
    renderList([])
    expect(
      screen.getByText(/You have no notes\. Add one by clicking the "Add note" button!/)
    ).toBeInTheDocument()
  })

  test('shows info when notes are unavailable', () => {
    renderList(null as unknown as Note[])
    expect(screen.getByText('Could not find notes!')).toBeInTheDocument()
  })

  test('renders the filter input when there is more than one note', () => {
    renderList([
      buildNote({ id: '1', title: 'A' }),
      buildNote({ id: '2', title: 'B' }),
    ])
    expect(screen.getByPlaceholderText('Filter notes...')).toBeInTheDocument()
  })

  test('does not render the filter input when there is only one note', () => {
    renderList([buildNote({ id: '1', title: 'A' })])
    expect(screen.queryByPlaceholderText('Filter notes...')).not.toBeInTheDocument()
  })

  test('renders the sort dropdown when there are more than two notes', () => {
    renderList([
      buildNote({ id: '1', title: 'A' }),
      buildNote({ id: '2', title: 'B' }),
      buildNote({ id: '3', title: 'C' }),
    ])
    expect(screen.getByLabelText('Sort:')).toBeInTheDocument()
  })

  test('renders pagination when there are more than ten notes', () => {
    const manyNotes = Array.from({ length: 11 }, (_, i) =>
      buildNote({ id: String(i + 1), title: `Note ${i + 1}` })
    )
    renderList(manyNotes)
    expect(screen.getAllByText('First').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Last').length).toBeGreaterThanOrEqual(1)
  })

  test('filters notes by title based on the filter value', () => {
    renderList(
      [
        buildNote({ id: '1', title: 'Alpha note' }),
        buildNote({ id: '2', title: 'Beta note' }),
      ],
      { filter: { ...defaultFilter, value: 'alpha' } }
    )
    expect(screen.getByText('Alpha note')).toBeInTheDocument()
    expect(screen.queryByText('Beta note')).not.toBeInTheDocument()
  })

  test('sorts notes alphabetically when sortNotes is ALPHABETIC', () => {
    const { container } = renderList(
      [
        buildNote({ id: '1', title: 'Banana' }),
        buildNote({ id: '2', title: 'Apple' }),
      ],
      { sortNotes: 'ALPHABETIC' }
    )
    const titles = Array.from(container.querySelectorAll('a')).map(
      (a) => a.textContent
    )
    expect(titles).toEqual(['Apple', 'Banana'])
  })

  test('truncates long note content to 150 characters', () => {
    const longContent = 'x'.repeat(200)
    renderList([buildNote({ id: '1', title: 'Long', content: longContent })])
    expect(screen.getByText(`${longContent.substring(0, 150)}...`)).toBeInTheDocument()
  })

  test('applies a new sort rule on the first selection', () => {
    const { store, container } = renderList(
      [
        buildNote({ id: '1', title: 'One', updatedAt: '2024-01-01T00:00:00Z' }),
        buildNote({ id: '2', title: 'Two', updatedAt: '2024-01-03T00:00:00Z' }),
        buildNote({ id: '3', title: 'Three', updatedAt: '2024-01-02T00:00:00Z' }),
      ],
      { sortNotes: 'MODIFIED' }
    )
    const select = screen.getByLabelText('Sort:') as HTMLSelectElement
    expect(select.value).toBe('MODIFIED')

    const titles = () =>
      Array.from(container.querySelectorAll('a')).map((a) => a.textContent)

    expect(titles()).toEqual(['Two', 'Three', 'One'])

    fireEvent.change(select, { target: { value: 'CREATED' } })

    expect(store.getState().sortNotes).toBe('CREATED')
    expect(select.value).toBe('CREATED')
    expect(titles()).toEqual(['Three', 'Two', 'One'])
  })
})
