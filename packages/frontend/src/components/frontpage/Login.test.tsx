import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import Login from './Login'

describe('login', () => {
  test('disables login while awaiting a response and allows retry after failure', async () => {
    let rejectLogin!: (error: Error) => void
    const actionForLogin = vi.fn(() => new Promise<void>((_resolve, reject) => {
      rejectLogin = reject
    }))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<Login actionForLogin={actionForLogin} />)
      const button = screen.getByRole('button', { name: 'Login' })
      fireEvent.submit(button.closest('form')!)
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
      fireEvent.submit(button.closest('form')!)
      expect(actionForLogin).toHaveBeenCalledTimes(1)
      await act(async () => rejectLogin(new Error('Request failed')))
      expect(button).toBeEnabled()
      expect(button).toHaveAttribute('aria-busy', 'false')
      expect(screen.getByText('Error')).toBeInTheDocument()
    } finally {
      consoleError.mockRestore()
    }
  })

  test('renders welcome message', () => {
    const actionForLogin = vi.fn()
    const init = vi.fn()
    render(<Login actionForLogin={actionForLogin} init={init} />)
    expect(screen.getByText('mystash')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('Dont have account?')).toBeInTheDocument()
  })
})
