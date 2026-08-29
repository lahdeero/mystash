import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Register from './Register'
import userReducer from '../../reducers/userReducer'
import notificationReducer from '../../reducers/notificationReducer'
import loginService from '../../services/loginService'

vi.mock('../../services/loginService', () => ({
  default: {
    register: vi.fn(),
  },
}))

const mockedLoginService = vi.mocked(loginService)

const renderRegister = () => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      notification: notificationReducer,
    },
  })
  const togglePage = vi.fn()
  const utils = render(
    <Provider store={store}>
      <Register togglePage={togglePage} />
    </Provider>
  )
  return { store, togglePage, ...utils }
}

describe('Register', () => {
  test('renders only nickname, password and email fields', () => {
    renderRegister()
    expect(screen.getByLabelText('Nickname(*)')).toBeInTheDocument()
    expect(screen.getByLabelText('Password(*)')).toBeInTheDocument()
    expect(screen.getByLabelText('Email(*)')).toBeInTheDocument()
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Last name')).not.toBeInTheDocument()
  })

  test('marks all required fields with an asterisk', () => {
    renderRegister()
    expect(screen.getByLabelText('Nickname(*)')).toBeInTheDocument()
    expect(screen.getByLabelText('Password(*)')).toBeInTheDocument()
    expect(screen.getByLabelText('Email(*)')).toBeInTheDocument()
  })

  test('renders a Terms and Conditions checkbox and a Register button', () => {
    renderRegister()
    expect(
      screen.getByLabelText('I have read and accept the Terms and Conditions')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
  })

  test('disables the Register button until the terms are accepted', () => {
    renderRegister()
    const button = screen.getByRole('button', { name: 'Register' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)

    fireEvent.click(
      screen.getByLabelText('I have read and accept the Terms and Conditions')
    )
    expect(button.disabled).toBe(false)
  })

  test('shows and hides the terms content via the link', () => {
    renderRegister()
    const toggle = screen.getByRole('link', { name: 'View Terms and Conditions' })

    fireEvent.click(toggle)
    expect(screen.getAllByText(/experimental/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/free from any responsibility/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Hide Terms and Conditions' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Hide Terms and Conditions' }))
    expect(
      screen.queryByText(/free from any responsibility/)
    ).not.toBeInTheDocument()
  })

  test('does not register when the terms are not accepted', async () => {
    const { togglePage } = renderRegister()

    fireEvent.change(screen.getByLabelText('Nickname(*)'), { target: { value: 'TestUser' } })
    fireEvent.change(screen.getByLabelText('Password(*)'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Email(*)'), { target: { value: 'test@example.com' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Register' }).closest('form')!)

    expect(mockedLoginService.register).not.toHaveBeenCalled()
    expect(togglePage).not.toHaveBeenCalled()
    expect(
      screen.getByText('You must accept the Terms and Conditions to register')
    ).toBeInTheDocument()
  })

  test('registers with nickname, password and email once terms are accepted', async () => {
    mockedLoginService.register.mockResolvedValue({
      nickname: 'TestUser',
      email: 'test@example.com',
      tier: 'free',
      hasAcceptedTerms: true,
    })
    const { togglePage } = renderRegister()

    fireEvent.click(
      screen.getByLabelText('I have read and accept the Terms and Conditions')
    )
    fireEvent.change(screen.getByLabelText('Nickname(*)'), { target: { value: 'TestUser' } })
    fireEvent.change(screen.getByLabelText('Password(*)'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Email(*)'), { target: { value: 'test@example.com' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Register' }).closest('form')!)

    await waitFor(() => {
      expect(mockedLoginService.register).toHaveBeenCalledWith({
        nickname: 'TestUser',
        password: 'password123',
        email: 'test@example.com',
      })
      expect(togglePage).toHaveBeenCalled()
    })
  })
})
