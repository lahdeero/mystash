import loginService from '../services/loginService'

const userReducer = (store = null, action) => {
  switch (action.type) {
  case 'REGISTER':
    return action.data
  case 'LOGIN':
    return action.data
  case 'LOGOUT':
    return null
  default:
    return store
  }
}

export const actionForRegister = (information) => {
  return async dispatch => {
    const response = await loginService.register(information)
    window.localStorage.setItem('MS_token', response.token)
    const user = await loginService.getUser()
    dispatch({
      type: 'REGISTER',
      data: user
    })
    return response
  }
}

export const setLogin = () => {
  return async (dispatch) => {
    const user = await loginService.getUser()
    dispatch({
      type: 'LOGIN',
      data: user
    })
  }
}

export const actionForLogin = (creditentals) => {
  return async (dispatch) => {
    const response = await loginService.login(creditentals)
    window.localStorage.setItem('MS_token', response.token)
    const user = await loginService.getUser()
    dispatch({
      type: 'LOGIN',
      data: user
    })
  }
}

export const actionForLogout = () => {
  return async (dispatch) => {
    dispatch({
      type: 'LOGOUT',
      data: null
    })
  }
}

export default userReducer
