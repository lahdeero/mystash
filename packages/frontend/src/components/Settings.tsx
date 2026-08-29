import { useEffect, useState } from 'react'
import styled from 'styled-components'

import loginService from '../services/loginService'
import { useAppDispatch } from '../store'
import { notify as notifyReducer, errorMessage as errorMessageReducer } from '../reducers/notificationReducer'
import Info from './common/Info'
import Button from './common/Button'
import { Theme } from '../layout/colors'

const SettingsContainer = styled.div`
  padding: 1rem;
`

const UserInfoWrapper = styled.div`
  padding: 1rem;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;

  label {
    margin-bottom: 0.3rem;
  }
`

const StyledInput = styled.input`
  color: ${({ theme }) => theme.Text};
  background-color: ${({ theme }) => theme.Background};
  border: 1px solid ${({ theme }) => theme.Border};
  border-radius: 0.3rem;
  padding: 0.4rem;
  max-width: 20rem;

  &:disabled {
    opacity: 0.6;
    color: ${({ theme }) => theme.Text};
    background-color: ${({ theme }) => theme.Background};
  }
`

const StyledText = styled.span`
  color: ${({ theme }) => theme.Text};
  padding: 0.4rem 0;
`

interface SettingsProps {
  currentTheme: Theme
  setCurrentTheme: (theme: Theme) => void
}

const Settings = ({ currentTheme, setCurrentTheme }: SettingsProps) => {
  const dispatch = useAppDispatch()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await loginService.getUser()
        setNickname(user.nickname ?? '')
        setEmail(user.email ?? '')
        setTier(user.tier ?? '')
      } catch (exception) {
        console.error(exception)
        dispatch(errorMessageReducer('Could not load your settings'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dispatch])

  const handleSave = async () => {
    try {
      const user = await loginService.editUserSettings({ nickname, email })
      dispatch({ type: 'LOGIN', data: user })
      setTier(user.tier ?? '')
      dispatch(notifyReducer('Settings updated'))
    } catch (exception) {
      console.error(exception)
      dispatch(errorMessageReducer('Could not update settings'))
    }
  }

  return (
    <SettingsContainer>
      <h2>Settings</h2>
      <div>
        <label htmlFor="theme">Change theme:</label>
        <select
          id="theme"
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value as Theme)}
        >
          <option value={Theme.Light}>Light</option>
          <option value={Theme.Dark}>Dark</option>
        </select>
      </div>
      <UserInfoWrapper>
        <Info>
          Update your information below.
        </Info>
        <Field>
          <label htmlFor="nickname">Nickname:</label>
          <StyledInput
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </Field>
        <Field>
          <label htmlFor="email">Email:</label>
          <StyledInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <label htmlFor="level">Level:</label>
          <StyledText id="level">{tier || 'free'}</StyledText>
        </Field>
        <Button onClick={handleSave} disabled={loading}>
          Save
        </Button>
      </UserInfoWrapper>
    </SettingsContainer>
  )
}

export default Settings
