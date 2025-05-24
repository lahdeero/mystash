import loginService from '../services/loginService'

const userReducer = (store = null, action: any) => {
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

export const actionForRegister = (information: any) => {
  return async (dispatch: any) => {
    await loginService.register(information)
    dispatch({
      type: 'REGISTER',
      data: null,
    })
  }
}

export const actionForLogin = (creditentals: any) => {
  return async (dispatch: any) => {
    const response = await loginService.login(creditentals)
    window.localStorage.setItem('MS_token', response.token)
    const user = response.user
    dispatch({
      type: 'LOGIN',
      data: user,
    })
  }
}

export const actionForLogout = () => {
  return async (dispatch: any) => {
    dispatch({
      type: 'LOGOUT',
      data: null,
    })
  }
}

export default userReducer
