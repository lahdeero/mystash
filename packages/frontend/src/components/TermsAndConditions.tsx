import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store'
import { notify as notifyReducer, errorMessage as errorMessageReducer } from '../reducers/notificationReducer'
import loginService from '../services/loginService'
import { Navbar } from './common/Navigation'
import Container from './common/Container'
import Button from './common/Button'
import Header from './common/Header'
import TextContainer from './common/TextContainer'

const TermsContent = styled.div`
  line-height: 1.5;
`

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
        <TermsContent>
          <p>
            Welcome to mystash. Please read these terms carefully before using
            the service.
          </p>
          <p>
            This site and its application are <strong>experimental</strong> and
            provided on an &quot;as is&quot; basis. Things may change, break, or
            disappear at any time without notice. Use it at your own risk.
          </p>
          <p>
            The owner and operators of this service are <strong>free from any
            responsibility</strong> for errors, data loss, interruptions, or any
            other issues arising from the use of the application. You are solely
            responsible for the content you create and for backing up your own
            data.
          </p>
          <p>
            By continuing you acknowledge that you understand the experimental
            nature of the service and accept these terms.
          </p>
        </TermsContent>
        <TextContainer>
          <Button onClick={acceptTerms}>Accept Terms</Button>
        </TextContainer>
      </Container>
    </div>
  )
}

export default TermsAndConditions
