import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import Login from './Login'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import notificationReducer from '../../reducers/notificationReducer'
import Notification from '../Notification'

const renderLogin = (props: React.ComponentProps<typeof Login>) => {
  const store = configureStore({ reducer: { notification: notificationReducer } })
  return render(
    <Provider store={store}>
      <Notification />
      <Login {...props} />
    </Provider>
  )
}

describe('login', () => {
  test.each([['ERR_BAD_REQUEST', 'Invalid credentials'], ['ERR_NETWORK', 'Error']])('shows %s in the notification and allows retry after failure', async (code, message) => {
    let rejectLogin!: (error: Error) => void
    const actionForLogin = vi.fn(() => new Promise<void>((_resolve, reject) => {
      rejectLogin = reject
    }))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      renderLogin({ actionForLogin })
      const button = screen.getByRole('button', { name: 'Login' })
      fireEvent.submit(button.closest('form')!)
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
      fireEvent.submit(button.closest('form')!)
      expect(actionForLogin).toHaveBeenCalledTimes(1)
      await act(async () => rejectLogin(Object.assign(new Error('Request failed'), { code })))
      expect(button).toBeEnabled()
      expect(button).toHaveAttribute('aria-busy', 'false')
      expect(screen.getByText(message).closest('.notification-wrapper')).toBeInTheDocument()
    } finally {
      consoleError.mockRestore()
    }
  })

  test('renders welcome message', () => {
    const actionForLogin = vi.fn()
    const init = vi.fn()
    renderLogin({ actionForLogin, init })
    expect(screen.getByText('mystash')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('Dont have account?')).toBeInTheDocument()
  })
})
