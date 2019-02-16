import React from 'react'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import 'jest-dom/extend-expect'
import { render, cleanup } from 'react-testing-library'
import rootReducer from '../reducers'
import Login from './Login'

afterEach(cleanup)

test('renders content', () => {
  const store = createStore(rootReducer, applyMiddleware(thunk))
  const component = render(
    <Login store={store} />
  )

  expect(component.container).toHaveTextContent(
    'username'
  )
  expect(component.container).toHaveTextContent(
    'password'
  )
  expect(component.container).toHaveTextContent(
    'Register'
  )
})
