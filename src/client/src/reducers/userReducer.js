import loginService from '../services/LoginService'
import noteService from '../services/NoteService'

const userReducer = (store = null, action) => {
  switch (action.type) {
    case 'REGISTER':
      return (store = action.data)
    case 'LOGIN':
      return (store = action.data)
    case 'LOGOUT':
      return (store = null)
    default:
      return store
  }
}

export const actionForRegister = (information) => {
  return async () => {
    const tokenAndMessage = await loginService.register(information)
    return tokenAndMessage
  }
}

export const setLogin = (user) => {
  noteService.setToken(user.token)
  console.log(user)
  return async (dispatch) => {
    dispatch({
      type: 'NOTHING',
      data: user
    })
  }
}

export const actionForLogin = (creditentals) => {
  return async (dispatch) => {
    const response = await loginService.login(creditentals)
    await noteService.setToken(response.token)
    await window.localStorage.setItem('loggedMystashappUser', JSON.stringify({ token: response.token }))
    dispatch({
      type: 'LOGIN',
      data: response.user
    })
    return response.user
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
