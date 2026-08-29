import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Settings from './Settings'
import userReducer from '../reducers/userReducer'
import notificationReducer from '../reducers/notificationReducer'
import loginService from '../services/loginService'

vi.mock('../services/loginService', () => ({
  default: {
    getUser: vi.fn(),
    editUserSettings: vi.fn(),
  },
}))

const mockedLoginService = vi.mocked(loginService)

const currentUser = {
  nickname: 'TestUser',
  email: 'test@example.com',
  tier: 'free',
  hasAcceptedTerms: true,
}

const renderSettings = () => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      notification: notificationReducer,
    },
    preloadedState: {
      user: currentUser,
      notification: [],
    },
  })
  return {
    store,
    ...render(
      <Provider store={store}>
        <Settings currentTheme={'light' as any} setCurrentTheme={vi.fn()} />
      </Provider>
    ),
  }
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedLoginService.getUser.mockResolvedValue(currentUser)
  })

  test('loads and shows the current nickname, email and level', async () => {
    renderSettings()
    await waitFor(() => {
      expect(screen.getByLabelText('Nickname:')).toHaveValue('TestUser')
    })
    expect(screen.getByLabelText('Email:')).toHaveValue('test@example.com')
    expect(screen.getByText('Level:')).toBeInTheDocument()
    expect(screen.getByText('free')).toBeInTheDocument()
  })

  test('allows editing nickname and email and saving them', async () => {
    mockedLoginService.editUserSettings.mockResolvedValue({
      ...currentUser,
      nickname: 'NewNick',
      email: 'new@example.com',
    })
    const { store } = renderSettings()

    await waitFor(() => {
      expect(screen.getByLabelText('Nickname:')).toHaveValue('TestUser')
    })

    fireEvent.change(screen.getByLabelText('Nickname:'), { target: { value: 'NewNick' } })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'new@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockedLoginService.editUserSettings).toHaveBeenCalledWith({
        nickname: 'NewNick',
        email: 'new@example.com',
      })
      expect(store.getState().user.nickname).toBe('NewNick')
    })
  })

  test('shows level as read-only text, not an input', async () => {
    renderSettings()
    await waitFor(() => {
      expect(screen.getByText('free')).toBeInTheDocument()
    })
    expect(screen.queryByLabelText('Level:') as unknown).not.toBeInstanceOf(HTMLInputElement)
  })
})
