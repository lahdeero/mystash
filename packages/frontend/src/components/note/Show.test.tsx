import { render, screen, within } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import Show from './Show'
import type { Note } from '@mystash/shared'

const defaultNote = {
  id: '123',
  userId: '1337',
  title: 'Test Note',
  content: 'This is a test note.',
  tags: ['test', 'note'],
  updatedAt: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
} satisfies Note

const notify = vi.fn()
const removeNote = vi.fn()

const renderShow = (note: Note = defaultNote) => {
  const store = configureStore({
    reducer: {
      notes: () => [note],
      notification: () => null,
    },
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/notes/${note.id}`]}>
        <Routes>
          <Route
            path="/notes/:id"
            element={<Show notify={notify} removeNote={removeNote} />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('Show', () => {
  test('should render title', () => {
    const title = 'Hello test note'
    const note = { ...defaultNote, title }
    renderShow(note)
    expect(screen.getByText(title)).toBeInTheDocument()
  })

  test('should render content', () => {
    const content = 'This is the content of the test note.'
    const note = { ...defaultNote, content }
    renderShow(note)
    expect(screen.getByText(content)).toBeInTheDocument()
  })

  test('should render tags', () => {
    const tags = ['tag1', 'tag2', 'tag3']
    const note = { ...defaultNote, tags }
    renderShow(note)
    expect(screen.getByText('[tag1,tag2,tag3]')).toBeInTheDocument()
  })

  test('should render edit button', () => {
    renderShow()
    expect(screen.getByRole('button', { name: 'EDIT' })).toBeInTheDocument()
  })

  test('should render add file button', () => {
    renderShow()
    expect(screen.getByRole('button', { name: 'ADD FILE' })).toBeInTheDocument()
  })

  test('should render delete button', () => {
    renderShow()
    expect(screen.getByRole('button', { name: 'DELETE' })).toBeInTheDocument()
  })

  test('should render br tags in content', async () => {
    const content = 'Line 1\n\nLine 2\n\nLine 3'
    const note = { ...defaultNote, content }
    const { container } = renderShow(note)
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
    expect(screen.getByText('Line 3')).toBeInTheDocument()
    const wrapper = container.querySelector(
      '[data-testid="note-content-wrapper"]'
    )
    const brTags = wrapper?.querySelectorAll('br')
    expect(brTags).toBeDefined()
    expect(brTags).toHaveLength(5) // [ 'Line 1', '', 'Line 2', '', 'Line 3' ]
  })

  test('should render links in content', () => {
    const content = `adsad\n\nhttps://kick.com/gmhikaru\n\nfoobar\n\nwww.twitch.tv/thebausffs\n\nhttps://youtube.com/@NordnetSuomi\n\nhttp://\n\nkuuba\n\nwww.asd\n\nhello.world.com`
    const note = { ...defaultNote, content }
    renderShow(note)
    // Expect 3 links within note-content-wrapper
    expect(
      within(screen.getByTestId('note-content-wrapper')).getAllByRole('link')
    ).toHaveLength(3)
    expect(
      screen.getByRole('link', { name: 'https://kick.com/gmhikaru' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'www.twitch.tv/thebausffs' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'https://youtube.com/@NordnetSuomi' })
    ).toBeInTheDocument()
  })
})
