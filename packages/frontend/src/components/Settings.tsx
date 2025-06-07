import { useEffect, useState } from 'react'
import styled from 'styled-components'

import loginService from '../services/loginService'
import Info from './common/Info'

const SettingsContainer = styled.div`
  padding: 1rem;
`

const UserInfoWrapper = styled.div`
  padding: 1rem;
`

const InfoRow = styled.div`
  display: flex;
  > * {
    padding: 0 .1rem;
  }
`

const Settings = () => {
  const [firstName, setFirstname] = useState('Loading...')
  const [lastName, setLastname] = useState('')
  const [tier, setTier] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const user = await loginService.getUser()
      setFirstname(user.firstName)
      setLastname(user.lastName)
      setTier(user.tier)
      setEmail(user.email)
    }
    fetchData()
  }, [setFirstname, setLastname, setTier, setEmail])

  return (
    <SettingsContainer>
      <UserInfoWrapper>
        <Info>
          {'Currently can\'t change your information'}
        </Info>
        <div>
          <div>
            <InfoRow>
              <label htmlFor="username">Firstname:</label>
              <input id="username" value={firstName} disabled />
            </InfoRow>
            <InfoRow>
              <label htmlFor="realname">Lastname:</label>
              <input id="realname" value={lastName} disabled />
            </InfoRow>
            <InfoRow>
              <label htmlFor="level">Level:</label>
              <input id="level" value={tier} disabled />
            </InfoRow>
            <InfoRow>
              <label htmlFor='email'>Email:</label>
              <input id="email" value={email} disabled />
            </InfoRow>
          </div>
        </div>
      </UserInfoWrapper>
    </SettingsContainer>
  )
}

export default Settings
