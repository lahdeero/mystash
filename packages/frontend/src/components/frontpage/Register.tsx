import { useState } from 'react'
import { actionForRegister } from '../../reducers/userReducer'
import { notify as notifyReducer, errorMessage as errorMessageReducer } from '../../reducers/notificationReducer'
import { useAppDispatch } from '../../store'
import { ClipLoader } from 'react-spinners'
import { Navbar } from '../common/Navigation'
import Input from '../common/Input'
import Button from '../common/Button'
import Container from '../common/Container'
import Link from '../common/Link'
import TextContainer from '../common/TextContainer'
import Header from '../common/Header'

const Register = ({ togglePage }: any) => {
  const dispatch = useAppDispatch()
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
      await dispatch(actionForRegister({
        firstName,
        lastName,
        password,
        email
      }))
      dispatch(notifyReducer(`Registered successfully with email: ${email}`))
      togglePage(event)
    } catch (exception) {
      setLoading(false)
      console.error(exception)
      dispatch(errorMessageReducer('Registration failed'))
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
        <Header text="Register" />
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
          Back to <Link onClick={togglePage}>login</Link>
        </TextContainer>
      </Container>
    </div>
  )
}

export default Register
