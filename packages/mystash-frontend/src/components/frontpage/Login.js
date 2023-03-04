import React, { useState } from 'react'
import { ClipLoader } from 'react-spinners'
import styled from 'styled-components'
import githubLoginImage from '../../assets/github_login.png'
import { Navbar } from '../common/Navigation'
import Input from '../common/Input'
import Icon from '../common/Icon'
import Button from '../common/Button'
import Container from '../common/Container'
import { resolveUrl } from '../../utils/environmentResolvers'
import Colors from '../../layout/colors'

const FlexItem = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`

const Suggestion = styled.div`
  margin-top: 10vh;
`

const LoginSeparator = styled.div`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #000;
  line-height: 0.1em;
  margin: 2rem 0;

  span {
    background-color: ${Colors.Background};
    padding:0 10px;
  }
`

const ErrorText = styled.div`
  color: black;
  background-color: red;
  font-size: 20px;
  border-style: solid;
  border-radius: 5px;
  padding: 10px;
  margin: 0 0 10px;
`

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const backendUrl = resolveUrl()
  console.debug('backend url:', backendUrl)
  const githubLoginUrl = `${backendUrl}/api/login/github`

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      await props.actionForLogin({
        username: username,
        password: password
      })
    } catch (exception) {
      console.error(exception)
      setLoading(false)
      if (exception.code === 'ERR_BAD_REQUEST') {
        setError('Invalid credentials')
      } else {
        setError('Error')
      }
    }
  }

  return (
    <div>
      <Navbar className="indigo" brand='mystash' href={process.env.PUBLIC_URL} right>
      </Navbar>
      <Container>
        <FlexItem>
          <a href={githubLoginUrl}>
            <img src={githubLoginImage} alt="Login with GitHub" />
          </a>
        </FlexItem>
        <LoginSeparator><span>OR</span></LoginSeparator>
        <ClipLoader loading={loading} color='blue' />
        {error !== '' ? <ErrorText>{error}</ErrorText> : <div></div>}
        <form onSubmit={handleLogin}>
          <div>
            username:
            <Input
              type="text"
              name="username"
              autoComplete="off"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            ><Icon>account_circle</Icon></Input>
          </div>
          <div>
            password:
            <Input
              type="password"
              name="password"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            ><Icon>https</Icon></Input>
          </div>
          <Button type="submit">Login</Button>
        </form>
        <Suggestion>
          Dont have account? <a onClick={props.togglePage} href="/register">Register</a>
        </Suggestion>
      </Container>
    </div >
  )
}

export default Login
