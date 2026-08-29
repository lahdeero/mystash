import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store'
import { notify as notifyReducer, errorMessage as errorMessageReducer } from '../reducers/notificationReducer'
import loginService from '../services/loginService'
import { Navbar } from './common/Navigation'
import Container from './common/Container'
import Button from './common/Button'
import Header from './common/Header'
import TextContainer from './common/TextContainer'
import { TermsText } from './TermsContent'

const TermsAndConditions = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const acceptTerms = async () => {
    try {
      const user = await loginService.editUserSettings({ hasAcceptedTerms: true })
      dispatch({ type: 'LOGIN', data: user })
      dispatch(notifyReducer('You have accepted the terms and conditions'))
      navigate('/')
    } catch (exception) {
      console.error(exception)
      dispatch(errorMessageReducer('Could not accept the terms. Please try again.'))
    }
  }

  return (
    <div>
      <Navbar brand="mystash" href={'/'} right />
      <Container>
        <Header text="Terms and Conditions" />
        <TermsText />
        <TextContainer>
          <Button onClick={acceptTerms}>Accept Terms</Button>
        </TextContainer>
      </Container>
    </div>
  )
}

export default TermsAndConditions
