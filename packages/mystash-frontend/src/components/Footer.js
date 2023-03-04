import React from 'react'
import styled from 'styled-components'
import versionResolver from '../utils/versionResolver'
import Colors from '../layout/colors'
import GithubLink from '../assets/github_link.svg'

const FooterWrapper = styled.div`
  background-color: ${Colors.Nav};
  color: ${Colors.White};
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  flex-shrink: 0;

  img {
    height: 2rem;
    width: 2rem;
  }
`

const Footer = () => (
  <FooterWrapper>
    <div>
      mystash v. {versionResolver}
    </div>
    <a href="https://github.com/lahdeero/mystash-frontend" rel="noreferrer" target="_blank">
      <img src={GithubLink} alt="Link to github repository"/>
    </a>
  </FooterWrapper>
)


export default Footer
