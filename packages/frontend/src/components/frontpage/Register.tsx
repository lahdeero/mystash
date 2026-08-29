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
import { TermsText } from '../TermsContent'

const Register = ({ togglePage }: any) => {
  const dispatch = useAppDispatch()
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleRegister = async (event: any) => {
    event.preventDefault()
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to register')
      setTimeout(() => {
        setError('')
      }, 5000)
      return
    }
    setLoading(true)
    try {
      await dispatch(actionForRegister({
        nickname,
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
              <Input type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} name="nickname" label="Nickname(*)" />
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} name="password" label="Password(*)" />
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} name="email" label="Email(*)" />
            </div>
            <div className="terms-acceptance">
              <label htmlFor="accept-terms">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />{' '}
                I have read and accept the Terms and Conditions
              </label>
              <div>
                <Link
                  onClick={(event) => {
                    event.preventDefault()
                    setShowTerms((show) => !show)
                  }}
                >
                  {showTerms ? 'Hide' : 'View'} Terms and Conditions
                </Link>
              </div>
              {showTerms && <TermsText />}
            </div>
            <Button type="submit" disabled={!termsAccepted}>
              Register
            </Button>
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
