import { render, screen } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import Login from './Login'

describe('login', () => {
  test('renders welcome message', () => {
    const actionForLogin = vi.fn()
    const init = vi.fn()
    render(
      <Login actionForLogin={actionForLogin} init={init} />
    )
    expect(screen.getByText('mystash')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('Dont have account?')).toBeInTheDocument()
  })
})
