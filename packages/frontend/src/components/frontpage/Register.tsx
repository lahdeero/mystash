import { useState } from 'react'
import { actionForRegister } from '../../reducers/userReducer'
import { notify as notifyReducer, errorMessage as errorMessageReducer } from '../../reducers/notificationReducer'
import { useAppDispatch } from '../../store'
import { Navbar } from '../common/Navigation'
import Input from '../common/Input'
import Button from '../common/Button'
import Container from '../common/Container'
import Link from '../common/Link'
import TextContainer from '../common/TextContainer'
import Header from '../common/Header'
import Modal from '../common/Modal'
import { TermsText } from '../TermsContent'

const Register = ({ togglePage }: any) => {
  const dispatch = useAppDispatch()
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)

  const handleRegister = async (event: any) => {
    event.preventDefault()
    if (loading) return
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
      console.error(exception)
      dispatch(errorMessageReducer('Registration failed'))
      setError('Could not register..')
      setTimeout(() => {
        setError('')
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar brand='mystash' href={"/"} right />
      <Container className="container">
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
                    setTermsModalOpen(true)
                  }}
                >
                  View Terms and Conditions
                </Link>
              </div>
            </div>
            <Button type="submit" disabled={!termsAccepted} loading={loading}>
              Register
            </Button>
          </form>
        </div>
        <TextContainer>
          Back to <Link onClick={togglePage}>login</Link>
        </TextContainer>
      </Container>
      <Modal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms and Conditions"
      >
        <TermsText />
        <Button onClick={() => setTermsModalOpen(false)}>Close</Button>
      </Modal>
    </div>
  )
}

export default Register
