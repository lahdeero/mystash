import React, { useEffect, useState } from 'react'
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
  const [username, setUsername] = useState('Loading...')
  const [realname, setRealname] = useState('')
  const [tier, setTier] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    loginService.getUser().then(user => {
      setUsername(user.username)
      setRealname(user.realname)
      setTier(user.tier)
      setEmail(user.email)
    })
  })

  return (
    <SettingsContainer>
      <UserInfoWrapper>
        <Info>
          {'Currently can\'t change your information'}
        </Info>
        <div>
          <div>
            <InfoRow>
              <label htmlFor="username">Username:</label>
              <input id="username" value={username} disabled />
            </InfoRow>
            <InfoRow>
              <label htmlFor="realname">Name:</label>
              <input id="realname" value={realname} disabled />
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
