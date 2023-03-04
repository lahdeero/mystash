import React, { useState } from 'react'
import { connect } from 'react-redux'
import { actionForRegister, setLogin } from '../reducers/userReducer'
import { ClipLoader } from 'react-spinners'
import { Navbar } from './common/Navigation'
import Input from './common/Input'
import Icon from './common/Icon'
import Button from './common/Button'
import Container from './common/Container'

const Register = (props) => {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await props.actionForRegister({
        realname: `${firstname} ${lastname}`,
        username: username,
        password: password,
        email: email
      })
      props.init()
    } catch (exception) {
      setLoading(false)
      console.error(exception)
      setError('Could not register..')
      setTimeout(() => {
        setError('')
      }, 5000)
    }
  }

  return (
    <div>
      <Navbar className="indigo" brand='mystash' href={process.env.PUBLIC_URL} right>
      </Navbar>
      <Container className="container">
        <ClipLoader loading={loading} color='blue' />
        <div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleRegister}>
            <div>
              <Input onChange={(event) => setFirstname(event.target.value)} name="firstname" label="First Name" ><Icon>accessibility</Icon></Input>
              <Input onChange={(event) => setLastname(event.target.value)} name="lastname" s={6} label="Last name" ><Icon>accessibility_new</Icon></Input>
              <Input onChange={(event) => setUsername(event.target.value)} name="username" s={12} label="Username(*)" ><Icon>account_circle</Icon></Input>
              <Input onChange={(event) => setPassword(event.target.value)} name="password" type="password" label="Password(*)" s={12} ><Icon>https</Icon></Input>
              <Input onChange={(event) => setEmail(event.target.value)} name="email" type="email" label="Email" s={12} ><Icon>email</Icon></Input>
            </div>
            <Button type="submit">Register</Button>
          </form>
        </div>
        <br />
        <br />
        Back to <a onClick={props.handleRegisterRedirect} href={process.env.PUBLIC_URL}>login</a>
      </Container>
    </div>
  )
}

const mapStateToProps = (store) => {
  return {
    notes: store.notes,
    user: store.user
  }
}
const mapDispatchToProps = {
  actionForRegister,
  setLogin
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register)
