import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { UploadComponent } from './Upload'
import fileService from '../../services/fileService'
import notes from '../../reducers/noteReducer'
import notification from '../../reducers/notificationReducer'
import type { Note } from '@mystash/shared'

vi.mock('../../services/fileService', () => ({
  default: {
    create: vi.fn(),
    upload: vi.fn(),
    scanFiles: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({ id: '123' })),
  }
})

const mockedFileService = vi.mocked(fileService)

const defaultNote = {
  id: '123',
  userId: '1337',
  title: 'Test Note',
  content: 'This is a test note.',
  tags: ['test', 'note'],
  updatedAt: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
} satisfies Note

const createFileList = (files: File[]) => {
  const list: any = {
    length: files.length,
    item: (index: number) => files[index],
  }
  files.forEach((file, index) => {
    list[index] = file
  })
  return list as FileList
}

const renderUpload = (note: Note = defaultNote) => {
  const store = configureStore({
    reducer: {
      notes,
      notification,
    },
    preloadedState: {
      notes: [note],
      notification: [],
    },
  })

  render(
    <Provider store={store}>
      <UploadComponent />
    </Provider>
  )
  return store
}

describe('Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders dropzone and upload button', () => {
    renderUpload()
    expect(screen.getByText('Drop files here, or click to select one or more.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'UPLOAD' })).toBeInTheDocument()
  })

  test('shows selected file list when files are chosen', () => {
    renderUpload()

    const fileInput = screen.getByTestId('upload-file-input') as HTMLInputElement
    const files = [new File(['abc'], 'one.txt', { type: 'text/plain' }), new File(['def'], 'two.txt', { type: 'text/plain' })]
    fireEvent.change(fileInput, { target: { files: createFileList(files) } })

    expect(screen.getByText('2 file(s) selected')).toBeInTheDocument()
    expect(screen.getByText('one.txt')).toBeInTheDocument()
    expect(screen.getByText('two.txt')).toBeInTheDocument()
  })

  test('uploads multiple files and calls notify', async () => {
    mockedFileService.create.mockResolvedValueOnce({ uploadUrl: 'http://upload/1', id: 'file-1' })
    mockedFileService.create.mockResolvedValueOnce({ uploadUrl: 'http://upload/2', id: 'file-2' })
    mockedFileService.upload.mockResolvedValue({})
    mockedFileService.scanFiles.mockResolvedValue([{ id: 'file-1' }, { id: 'file-2' }])

    const store = renderUpload()

    const fileInput = screen.getByTestId('upload-file-input') as HTMLInputElement
    const files = [new File(['abc'], 'one.txt', { type: 'text/plain' }), new File(['def'], 'two.txt', { type: 'text/plain' })]
    fireEvent.change(fileInput, { target: { files: createFileList(files) } })

    const form = screen.getByTestId('upload-form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockedFileService.create).toHaveBeenCalledTimes(2)
      expect(mockedFileService.upload).toHaveBeenCalledTimes(2)
      expect(mockedFileService.scanFiles).toHaveBeenCalledWith(defaultNote.id)
      expect(store.getState().notification[0]).toBe('2 file(s) successfully uploaded!')
    })
  })

  test('shows error when no files are selected', async () => {
    const store = renderUpload()
    const form = screen.getByTestId('upload-form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(store.getState().notification[0]).toBe('No files selected')
    })
  })
})
