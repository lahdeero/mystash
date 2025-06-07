import { useState } from 'react'
import { connect } from 'react-redux'
import { actionForRegister } from '../../reducers/userReducer'
import { notify as notifyReducer, errorMessage as errorMessageReducer } from '../../reducers/notificationReducer'
import { ClipLoader } from 'react-spinners'
import { Navbar } from '../common/Navigation'
import Input from '../common/Input'
import Button from '../common/Button'
import Container from '../common/Container'
import TextContainer from '../common/TextContainer'

const Register = ({ notify, errorMessage, actionForRegister, togglePage}: any) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (event: any) => {
    event.preventDefault()
    setLoading(true)
    try {
      await actionForRegister({
        firstName,
        lastName,
        password,
        email
      })
      notify(`Registered successfully with email: ${email}`)
      togglePage(event)
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
      <Navbar brand='mystash' href={"/"} right />
      <Container className="container">
        <ClipLoader loading={loading} color='blue' />
        <div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleRegister}>
            <div>
              <Input type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} name="firstname" label="First Name" />
              <Input type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} name="lastname" label="Last name" />
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} name="password" label="Password(*)" />
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} name="email" label="Email" />
            </div>
            <Button type="submit">Register</Button>
          </form>
        </div>
        <TextContainer>
          Back to <a onClick={togglePage} href={'#'}>login</a>
        </TextContainer>
      </Container>
    </div>
  )
}

const mapStateToProps = (store: any) => {
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
