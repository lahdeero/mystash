import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import TermsAndConditions from './TermsAndConditions'
import userReducer from '../reducers/userReducer'
import notificationReducer from '../reducers/notificationReducer'
import loginService from '../services/loginService'

vi.mock('../services/loginService', () => ({
  default: {
    editUserSettings: vi.fn(),
  },
}))

const mockedLoginService = vi.mocked(loginService)

const acceptedUser = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  tier: 'free',
  hasAcceptedTerms: true,
}

const renderTerms = () => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      notification: notificationReducer,
    },
    preloadedState: {
      user: {
        ...acceptedUser,
        hasAcceptedTerms: false,
      },
      notification: [],
    },
  })
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/terms-and-conditions']}>
        <TermsAndConditions />
      </MemoryRouter>
    </Provider>
  )
  return { store, ...utils }
}

describe('TermsAndConditions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders the terms and conditions content', () => {
    renderTerms()
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument()
    expect(
      screen.getAllByText(/experimental/).length
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/free from any responsibility/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept Terms' })).toBeInTheDocument()
  })

  test('calls editUserSettings and updates the user on accept', async () => {
    mockedLoginService.editUserSettings.mockResolvedValue(acceptedUser)
    const { store } = renderTerms()

    fireEvent.click(screen.getByRole('button', { name: 'Accept Terms' }))

    await waitFor(() => {
      expect(mockedLoginService.editUserSettings).toHaveBeenCalledWith({
        hasAcceptedTerms: true,
      })
      expect(store.getState().user.hasAcceptedTerms).toBe(true)
    })
  })

  test('shows an error when accepting terms fails', async () => {
    mockedLoginService.editUserSettings.mockRejectedValue(new Error('boom'))
    const { store } = renderTerms()

    fireEvent.click(screen.getByRole('button', { name: 'Accept Terms' }))

    await waitFor(() => {
      expect(store.getState().user.hasAcceptedTerms).toBe(false)
      expect(store.getState().notification[0]).toBe(
        'Could not accept the terms. Please try again.'
      )
    })
  })
})
