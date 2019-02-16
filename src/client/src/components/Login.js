import '../App.css'
import React, { useState } from 'react'
import { Navbar, Input, Icon, Button } from 'react-materialize'
import Register from './Register'
import '../App.css'

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [register, setRegister] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await props.actionForLogin({
        username: username,
        password: password
      })
      await props.noteInitialization(user)
      // await props.setState({ user: user })
    } catch (exception) {
      setError('Bad credentials')
      console.log(exception)
      setTimeout(() => {
        setError('')
      }, 5000)
    }
  }
  const handleRegisterRedirect = async (event) => {
    event.preventDefault()
    setRegister(!register)
  }

  if (register) {
    return (
      <div>
        <Register handleRegisterRedirect={handleRegisterRedirect} />
      </div>
    )
  }
  return (
    <div>
      <Navbar className="indigo" brand='my-stash' right>
      </Navbar>
      <div className="container centered">
        <div>
          {error}
        </div>
        <form onSubmit={handleLogin}>
          <div>
            username:
            <Input
              type="text"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            ><Icon>account_circle</Icon></Input>
          </div>
          <div>
            password:
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            ><Icon>https</Icon></Input>
          </div>
          <Button type="submit">Login</Button>
        </form>
        <div>
          <br />
          Dont have account? <a onClick={handleRegisterRedirect} href="/register">Register here</a>
        </div>
      </div>
    </div>
  )
}

export default Login
