import React from 'react'
import styled from 'styled-components'

interface Props {
  href?: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  children: React.ReactNode
}

const LinkComponent = styled.a`
  color: ${({ theme }) => theme.Link};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.LinkVisited};
  }
`

const Link = ({ href = '#', className, onClick, children }: Props) => (
  <LinkComponent className={className} onClick={onClick} href={href}>
    {children}
  </LinkComponent>
)

export default Link
