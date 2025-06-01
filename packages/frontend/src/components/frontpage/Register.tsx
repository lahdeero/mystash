import React, { useState } from 'react'
import { connect } from 'react-redux'
import { actionForRegister } from '../../reducers/userReducer'
import { notify as notifyReducer, errorMessage as errorMessageReducer } from '../../reducers/notificationReducer'
import { ClipLoader } from 'react-spinners'
import { Navbar } from '../common/Navigation'
import Input from '../common/Input'
import Icon from '../common/Icon'
import Button from '../common/Button'
import Container from '../common/Container'
import TextContainer from '../common/TextContainer'

const Register = (props) => {
  const { notify, errorMessage } = props
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await props.actionForRegister({
        firstName,
        lastName,
        password,
        email
      })
      notify(`Registered successfully with email: ${email}`)
      props.togglePage(event)
    } catch (exception) {
      setLoading(false)
      console.error(exception)
      errorMessage('Registration failed')
      setError('Could not register..')
      setTimeout(() => {
        setError('')
      }, 5000)
    }
  }

  return (
    <div>
      <Navbar brand='mystash' href={import.meta.env.VITE_PUBLIC_URL} right />
      <Container className="container">
        <ClipLoader loading={loading} color='blue' />
        <div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleRegister}>
            <div>
              <Input type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} name="firstname" label="First Name" ><Icon>accessibility</Icon></Input>
              <Input type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} name="lastname" label="Last name" ><Icon>accessibility_new</Icon></Input>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} name="password" label="Password(*)"><Icon>https</Icon></Input>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} name="email" label="Email"><Icon>email</Icon></Input>
            </div>
            <Button type="submit">Register</Button>
          </form>
        </div>
        <TextContainer>
          Back to <a onClick={props.togglePage} href={'#'}>login</a>
        </TextContainer>
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
  notify: notifyReducer,
  errorMessage: errorMessageReducer
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register)
