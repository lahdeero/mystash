import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from './Login'

describe('login', () => {
  beforeEach(() => {
    const actionForLogin = jest.fn()
    const init = jest.fn()

    render(
      <Login actionForLogin={actionForLogin} init={init} />
    )
  })

  it('renders welcome message', () => {
    expect(screen.getByText('mystash')).toBeInTheDocument()
    expect(screen.getByText('username:')).toBeInTheDocument()
    expect(screen.getByText('password:')).toBeInTheDocument()
    expect(screen.getByText('Dont have account?')).toBeInTheDocument()
  })
})
